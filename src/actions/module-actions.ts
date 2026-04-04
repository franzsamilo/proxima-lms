"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createModuleSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function createModule(formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const parsed = createModuleSchema.safeParse({
    title: formData.get("title"),
    courseId: formData.get("courseId"),
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const lastModule = await prisma.module.findFirst({
    where: { courseId: parsed.data.courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const order = (lastModule?.order ?? 0) + 1

  const module = await prisma.module.create({
    data: {
      title: parsed.data.title,
      courseId: parsed.data.courseId,
      order,
    },
  })

  revalidatePath(`/courses/${parsed.data.courseId}`)
  return { success: true, moduleId: module.id }
}

export async function updateModule(moduleId: string, formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!existing) return { error: "Module not found" }

  const updateData: Record<string, unknown> = {}

  const title = formData.get("title")
  if (title !== null) updateData.title = String(title)

  const order = formData.get("order")
  if (order !== null) updateData.order = Number(order)

  const status = formData.get("status")
  if (status !== null) updateData.status = String(status)

  await prisma.module.update({
    where: { id: moduleId },
    data: updateData,
  })

  revalidatePath(`/courses/${existing.courseId}`)
  return { success: true }
}

export async function deleteModule(moduleId: string) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!existing) return { error: "Module not found" }

  await prisma.module.delete({ where: { id: moduleId } })

  revalidatePath(`/courses/${existing.courseId}`)
  return { success: true }
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  await requireRole(["TEACHER", "ADMIN"])

  await prisma.$transaction(
    moduleIds.map((id, i) =>
      prisma.module.update({ where: { id }, data: { order: i + 1 } })
    )
  )

  revalidatePath(`/courses/${courseId}`)
  return { success: true }
}
