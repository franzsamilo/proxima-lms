"use server"

import { requireRole, requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createKitSchema, updateKitSchema } from "@/lib/validations"

export async function assignKit(formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const kitId = formData.get("kitId") as string
  const userId = formData.get("userId") as string

  if (!kitId || !userId) return { error: "kitId and userId are required" }

  const [kit, user] = await Promise.all([
    prisma.hardwareKit.findUnique({ where: { id: kitId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])
  if (!kit) return { error: "Hardware kit not found" }
  if (!user) return { error: "User not found" }

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
  const sessionUser = await requireAuth()
  const role = (sessionUser as { role?: string }).role
  if (role !== "TEACHER" && role !== "ADMIN" && role !== "STUDENT") {
    return { error: "Forbidden" }
  }

  const existing = await prisma.hardwareAssignment.findUnique({
    where: { id: assignmentId },
  })

  if (!existing) return { error: "Assignment not found" }

  // Students can only return their own kits.
  if (role === "STUDENT" && existing.userId !== sessionUser.id) {
    return { error: "Forbidden" }
  }

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

  const totalQtyRaw = formData.get("totalQty")
  const totalQty = totalQtyRaw === null ? NaN : Number(totalQtyRaw)

  const parsed = createKitSchema.safeParse({
    name: formData.get("name") ?? undefined,
    level: formData.get("level") ?? undefined,
    specs: formData.get("specs") ?? undefined,
    totalQty: Number.isNaN(totalQty) ? undefined : totalQty,
    imageEmoji: (formData.get("imageEmoji") as string) || "🤖",
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await prisma.hardwareKit.create({ data: parsed.data })

  revalidatePath("/hardware")
  return { success: true }
}

export async function updateKit(kitId: string, formData: FormData) {
  await requireRole(["ADMIN"])

  const existing = await prisma.hardwareKit.findUnique({ where: { id: kitId } })
  if (!existing) return { error: "Kit not found" }

  const totalQtyRaw = formData.get("totalQty")
  const totalQtyParsed = totalQtyRaw === null ? undefined : Number(totalQtyRaw)

  const parsed = updateKitSchema.safeParse({
    name: formData.get("name") ?? undefined,
    level: formData.get("level") ?? undefined,
    specs: formData.get("specs") ?? undefined,
    totalQty:
      totalQtyParsed === undefined || Number.isNaN(totalQtyParsed)
        ? undefined
        : totalQtyParsed,
    imageEmoji: formData.get("imageEmoji") ?? undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Data integrity: prevent dropping totalQty below current active assignments.
  if (parsed.data.totalQty !== undefined) {
    const activeCount = await prisma.hardwareAssignment.count({
      where: { kitId, returnedAt: null },
    })
    if (parsed.data.totalQty < activeCount) {
      return {
        error: `totalQty cannot be less than current active assignments (${activeCount})`,
      }
    }
  }

  await prisma.hardwareKit.update({ where: { id: kitId }, data: parsed.data })

  revalidatePath("/hardware")
  return { success: true }
}
