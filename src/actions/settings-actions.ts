"use server"

import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations"
import type { Role } from "@prisma/client"

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { error: string; fieldErrors?: Record<string, string[] | undefined> }

/**
 * Update the current user's profile.
 *
 * Field allowlist: name, department.
 *
 * IMPORTANT: This action intentionally does NOT read `email` from form data.
 * Users cannot change their email — the field is also disabled in the UI, but
 * this server-side allowlist is the actual guarantee. Do not add `email` here
 * without a deliberate review of the auth/identity flow.
 *
 * `department` is meaningful for TEACHER/ADMIN only. For STUDENT we silently
 * strip the field rather than persist a value the rest of the app ignores.
 */
export async function updateProfile(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const sessionUser = await requireAuth()

  const rawName = formData.get("name")
  const rawDepartment = formData.get("department")

  const parsed = updateProfileSchema.safeParse({
    name: typeof rawName === "string" ? rawName.trim() : "",
    department:
      typeof rawDepartment === "string"
        ? rawDepartment.trim() || null
        : null,
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const firstError =
      fieldErrors.name?.[0] ??
      fieldErrors.department?.[0] ??
      "Invalid profile data."
    return { error: firstError, fieldErrors }
  }

  const role = sessionUser.role as Role
  const isStudent = role === "STUDENT"

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name: parsed.data.name,
      // Students do not have a meaningful department; strip silently.
      ...(isStudent
        ? {}
        : { department: parsed.data.department ?? null }),
    },
  })

  // Flush the entire dashboard layout tree so the sidebar/topbar user blocks
  // (which read via getCurrentUser at the layout level) refresh with the new
  // name. This also covers any other RSCs in the dashboard tree.
  //
  // NOTE: With session: { strategy: "jwt" } the JWT itself still carries the
  // pre-change name. Any client component that reads `useSession()` will see
  // stale data until next sign-in. The sidebar reads from the DB (server),
  // so it refreshes correctly here.
  revalidatePath("/", "layout")
  revalidatePath("/settings")

  return { success: true }
}

/**
 * Change the current user's password.
 *
 * Verifies the current password with bcrypt.compare, then hashes the new
 * password with cost 12 (parity with /api/auth/register).
 *
 * NOTE (deferred): This action does not invalidate other active sessions or
 * rate-limit failed attempts. With JWT sessions there is no DB session table
 * to revoke; a future fix could add `passwordChangedAt` on User and check it
 * in the jwt callback. Rate limiting would need a shared store (Redis or DB).
 * Both are tracked as deferred notes in the audit fix branch.
 */
export async function changePassword(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const sessionUser = await requireAuth()

  const rawCurrent = formData.get("currentPassword")
  const rawNew = formData.get("newPassword")
  const rawConfirm = formData.get("confirmPassword")

  const parsed = changePasswordSchema.safeParse({
    currentPassword: typeof rawCurrent === "string" ? rawCurrent : "",
    newPassword: typeof rawNew === "string" ? rawNew : "",
    confirmPassword: typeof rawConfirm === "string" ? rawConfirm : "",
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const firstError =
      fieldErrors.currentPassword?.[0] ??
      fieldErrors.newPassword?.[0] ??
      fieldErrors.confirmPassword?.[0] ??
      "Invalid password data."
    return { error: firstError, fieldErrors }
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  })
  if (!user) return { error: "User not found." }

  const isValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  )
  if (!isValid) {
    return { error: "Current password is incorrect." }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { passwordHash: newHash },
  })

  // Consistency with updateProfile — no rendered data depends on the hash,
  // but revalidating settings keeps the action surface uniform.
  revalidatePath("/settings")

  return { success: true }
}
