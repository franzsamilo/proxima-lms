"use server"

import { headers } from "next/headers"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import { Role, SchoolLevel } from "@prisma/client"
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit"

export type LoginActionResult = { ok: false; error: string } | undefined
export type RegisterActionResult =
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | undefined

const LOGIN_LIMIT = { limit: 8, windowMs: 60_000 } // 8 attempts/min/IP
const REGISTER_LIMIT = { limit: 3, windowMs: 60_000 } // 3 accounts/min/IP

async function clientIp() {
  return ipFromHeaders(await headers())
}

/**
 * Server-side login. signIn() with redirectTo emits a 302 whose response
 * also carries Set-Cookie for the new session — atomic, no client/server
 * cookie race. On credential failure we capture and return the message
 * for the form to surface inline.
 */
export async function loginAction(
  redirectTo: string,
  formData: FormData
): Promise<LoginActionResult> {
  const ip = await clientIp()
  const limit = rateLimit(`login:${ip}`, LOGIN_LIMIT)
  if (!limit.ok) {
    return {
      ok: false,
      error: `Too many sign-in attempts. Try again in ${limit.retryAfterSec}s.`,
    }
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { ok: false, error: "Email and passcode are required." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    })
    return undefined
  } catch (error) {
    // Auth.js surfaces credential failures as AuthError. Anything else
    // (including Next's redirect signal) must be re-thrown so the runtime
    // can complete its work.
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { ok: false, error: "Invalid credentials. Verify email and passcode." }
        case "CallbackRouteError":
          return { ok: false, error: "Sign-in service error. Please retry." }
        default:
          return { ok: false, error: "Sign-in failed. Please retry." }
      }
    }
    throw error
  }
}

/**
 * Server-side register + auto sign-in. Creates the user, then immediately
 * signIn(redirectTo). Atomic cookie set, no client/server race.
 */
export async function registerAction(
  formData: FormData
): Promise<RegisterActionResult> {
  const ip = await clientIp()
  const limit = rateLimit(`register:${ip}`, REGISTER_LIMIT)
  if (!limit.ok) {
    return {
      ok: false,
      error: `Too many registration attempts. Try again in ${limit.retryAfterSec}s.`,
    }
  }

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    role: String(formData.get("role") ?? "STUDENT"),
    schoolLevel: formData.get("schoolLevel")
      ? String(formData.get("schoolLevel"))
      : undefined,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors
    const fieldErrors: Record<string, string> = {}
    for (const [k, v] of Object.entries(fe)) {
      if (Array.isArray(v) && v.length) fieldErrors[k] = v[0]
    }
    return {
      ok: false,
      error: "Please fix the errors below.",
      fieldErrors,
    }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    })
    if (existing) {
      return {
        ok: false,
        error: "Account already exists.",
        fieldErrors: { email: "Email already registered" },
      }
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role as Role,
        schoolLevel: parsed.data.schoolLevel
          ? (parsed.data.schoolLevel as SchoolLevel)
          : null,
      },
      select: { id: true },
    })
  } catch (err) {
    console.error("[registerAction] DB error", err)
    return { ok: false, error: "Could not create account. Please retry." }
  }

  // Auto sign-in via redirect — atomic with cookie set.
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    })
    return undefined
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created but auto sign-in failed; send to /login.
      return {
        ok: false,
        error: "Account created. Please sign in.",
      }
    }
    throw error
  }
}
