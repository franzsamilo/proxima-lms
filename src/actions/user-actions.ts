"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { updateUserSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function updateUser(userId: string, formData: FormData) {
  const sessionUser = await requireRole(["ADMIN"])

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) return { error: "User not found" }

  // Normalise raw form inputs. FormData.get returns "" for empty-present fields.
  const rawName = formData.get("name")
  const rawRole = formData.get("role")
  const rawDepartment = formData.get("department")
  const rawSchoolLevel = formData.get("schoolLevel")

  const input: Record<string, unknown> = {}
  if (typeof rawName === "string" && rawName !== "") input.name = rawName
  if (typeof rawRole === "string" && rawRole !== "") input.role = rawRole
  if (typeof rawDepartment === "string") {
    input.department = rawDepartment === "" ? null : rawDepartment
  }
  if (typeof rawSchoolLevel === "string") {
    input.schoolLevel =
      rawSchoolLevel === "" || rawSchoolLevel === "null" ? null : rawSchoolLevel
  }

  const parsed = updateUserSchema.safeParse(input)

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Prevent admin self-demotion (would lock the system out of admin access).
  if (
    sessionUser.id === userId &&
    parsed.data.role &&
    parsed.data.role !== "ADMIN"
  ) {
    return { error: "Admins cannot demote themselves" }
  }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  })

  revalidatePath("/users")
  return { success: true }
}
