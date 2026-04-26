import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations"
import { Role, SchoolLevel } from "@prisma/client"
import { NextResponse } from "next/server"
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const REGISTER_LIMIT = { limit: 3, windowMs: 60_000 }

export async function POST(request: Request) {
  const ip = ipFromHeaders(request.headers)
  const r = rateLimit(`register-api:${ip}`, REGISTER_LIMIT)
  if (!r.ok) {
    return NextResponse.json(
      { message: "Too many registration attempts. Slow down." },
      { status: 429, headers: { "Retry-After": String(r.retryAfterSec) } }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const email = parsed.data.email.trim().toLowerCase()
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json(
      { errors: { email: ["Email already registered"] } },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role: parsed.data.role as Role,
      schoolLevel: parsed.data.schoolLevel ? (parsed.data.schoolLevel as SchoolLevel) : null,
    },
    select: { id: true, email: true },
  })

  return NextResponse.json(user, { status: 201 })
}
