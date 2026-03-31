"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { updateUserSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function updateUser(userId: string, formData: FormData) {
  await requireRole(["ADMIN"])

  const existing = await prisma.user.findUnique({ where: { id: userId } })
  if (!existing) return { error: "User not found" }

  const parsed = updateUserSchema.safeParse({
    name: formData.get("name") ?? undefined,
    role: formData.get("role") ?? undefined,
    department: formData.get("department") ?? undefined,
    schoolLevel: formData.get("schoolLevel") ?? undefined,
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  })

  revalidatePath("/users")
  revalidatePath(`/users/${userId}`)
  return { success: true }
}
