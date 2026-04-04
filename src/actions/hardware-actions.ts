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

export async function createKit(formData: FormData) {
  await requireRole(["ADMIN"])

  const name = formData.get("name") as string
  const level = formData.get("level") as string
  const specs = formData.get("specs") as string
  const totalQty = Number(formData.get("totalQty"))
  const imageEmoji = (formData.get("imageEmoji") as string) || "🤖"

  if (!name || !level || !specs || !totalQty) {
    return { error: "All fields are required" }
  }

  await prisma.hardwareKit.create({
    data: { name, level: level as any, specs, totalQty, imageEmoji },
  })

  revalidatePath("/hardware")
  return { success: true }
}

export async function updateKit(kitId: string, formData: FormData) {
  await requireRole(["ADMIN"])

  const existing = await prisma.hardwareKit.findUnique({ where: { id: kitId } })
  if (!existing) return { error: "Kit not found" }

  const updateData: Record<string, unknown> = {}

  const name = formData.get("name")
  if (name !== null) updateData.name = String(name)

  const level = formData.get("level")
  if (level !== null) updateData.level = String(level)

  const specs = formData.get("specs")
  if (specs !== null) updateData.specs = String(specs)

  const totalQty = formData.get("totalQty")
  if (totalQty !== null) updateData.totalQty = Number(totalQty)

  const imageEmoji = formData.get("imageEmoji")
  if (imageEmoji !== null) updateData.imageEmoji = String(imageEmoji)

  await prisma.hardwareKit.update({ where: { id: kitId }, data: updateData })

  revalidatePath("/hardware")
  return { success: true }
}
