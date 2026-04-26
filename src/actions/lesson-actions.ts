"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createLessonSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function createLesson(formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const parsed = createLessonSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    durationMins: formData.get("durationMins") ? Number(formData.get("durationMins")) : undefined,
    content: formData.get("content") ? JSON.parse(formData.get("content") as string) : undefined,
    codeSkeleton: formData.get("codeSkeleton") ?? undefined,
    moduleId: formData.get("moduleId"),
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: parsed.data.moduleId },
    orderBy: { order: "desc" },
    select: { order: true },
  })

  const order = (lastLesson?.order ?? 0) + 1

  const module = await prisma.module.findUnique({
    where: { id: parsed.data.moduleId },
    select: { courseId: true },
  })

  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      order,
    },
  })

  if (module) {
    revalidatePath(`/courses/${module.courseId}`)
  }

  return { success: true, lessonId: lesson.id }
}

export async function updateLesson(lessonId: string, formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  })

  if (!existing) return { error: "Lesson not found" }

  const updateData: Record<string, unknown> = {}

  const title = formData.get("title")
  if (title !== null) updateData.title = String(title)

  const type = formData.get("type")
  if (type !== null) updateData.type = String(type)

  const durationMins = formData.get("durationMins")
  if (durationMins !== null) updateData.durationMins = Number(durationMins)

  const content = formData.get("content")
  if (content !== null) updateData.content = JSON.parse(content as string)

  const codeSkeleton = formData.get("codeSkeleton")
  if (codeSkeleton !== null) updateData.codeSkeleton = String(codeSkeleton)

  // File attachment fields. "" means clear; null means skip.
  const fileUrl = formData.get("fileUrl")
  if (fileUrl !== null) updateData.fileUrl = fileUrl === "" ? null : String(fileUrl)
  const fileName = formData.get("fileName")
  if (fileName !== null) updateData.fileName = fileName === "" ? null : String(fileName)
  const fileMime = formData.get("fileMime")
  if (fileMime !== null) updateData.fileMime = fileMime === "" ? null : String(fileMime)
  const fileSize = formData.get("fileSize")
  if (fileSize !== null) updateData.fileSize = fileSize === "" ? null : Number(fileSize)

  await prisma.lesson.update({
    where: { id: lessonId },
    data: updateData,
  })

  revalidatePath(`/courses/${existing.module.courseId}`)
  return { success: true }
}

export async function deleteLesson(lessonId: string) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  })

  if (!existing) return { error: "Lesson not found" }

  await prisma.lesson.delete({ where: { id: lessonId } })

  revalidatePath(`/courses/${existing.module.courseId}`)
  return { success: true }
}

export async function reorderLessons(moduleId: string, lessonIds: string[]) {
  await requireRole(["TEACHER", "ADMIN"])

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  })

  await prisma.$transaction(
    lessonIds.map((id, i) =>
      prisma.lesson.update({ where: { id }, data: { order: i + 1 } })
    )
  )

  if (module) {
    revalidatePath(`/courses/${module.courseId}`)
  }

  return { success: true }
}
