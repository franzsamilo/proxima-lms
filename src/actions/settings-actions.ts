"use server"

import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const sessionUser = await requireAuth()

  const name = (formData.get("name") as string | null)?.trim()
  const department = (formData.get("department") as string | null)?.trim()

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters." }
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name,
      department: department || null,
    },
  })

  revalidatePath("/settings")
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const sessionUser = await requireAuth()

  const currentPassword = formData.get("currentPassword") as string | null
  const newPassword = formData.get("newPassword") as string | null
  const confirmPassword = formData.get("confirmPassword") as string | null

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." }
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." }
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } })
  if (!user) return { error: "User not found." }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return { error: "Current password is incorrect." }
  }

  const newHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { passwordHash: newHash },
  })

  return { success: true }
}
