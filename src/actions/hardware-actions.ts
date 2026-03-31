"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function assignKit(formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const kitId = formData.get("kitId") as string
  const userId = formData.get("userId") as string

  if (!kitId || !userId) return { error: "kitId and userId are required" }

  const kit = await prisma.hardwareKit.findUnique({ where: { id: kitId } })
  if (!kit) return { error: "Hardware kit not found" }

  const activeAssignments = await prisma.hardwareAssignment.count({
    where: { kitId, returnedAt: null },
  })

  if (activeAssignments >= kit.totalQty) {
    return { error: "No units available for this kit" }
  }

  const existingAssignment = await prisma.hardwareAssignment.findFirst({
    where: { kitId, userId, returnedAt: null },
  })

  if (existingAssignment) {
    return { error: "User already has this kit assigned" }
  }

  const assignment = await prisma.hardwareAssignment.create({
    data: { kitId, userId },
  })

  revalidatePath("/hardware")
  return { success: true, assignmentId: assignment.id }
}

export async function returnKit(assignmentId: string) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.hardwareAssignment.findUnique({
    where: { id: assignmentId },
  })

  if (!existing) return { error: "Assignment not found" }

  if (existing.returnedAt) {
    return { error: "Kit has already been returned" }
  }

  await prisma.hardwareAssignment.update({
    where: { id: assignmentId },
    data: { returnedAt: new Date() },
  })

  revalidatePath("/hardware")
  return { success: true }
}
