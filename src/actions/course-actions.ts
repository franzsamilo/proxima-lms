"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createCourseSchema } from "@/lib/validations"
import { getTierFromLevel } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function createCourse(formData: FormData) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    level: formData.get("level"),
    maxStudents: Number(formData.get("maxStudents")),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const course = await prisma.course.create({
    data: {
      ...parsed.data,
      tier: getTierFromLevel(parsed.data.level),
      instructorId: user.id,
    },
  })

  revalidatePath("/courses")
  return { success: true, courseId: course.id }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.course.findUnique({ where: { id: courseId } })
  if (!existing) return { error: "Course not found" }

  if (user.role !== "ADMIN" && existing.instructorId !== user.id) {
    return { error: "Forbidden" }
  }

  const partial = createCourseSchema.partial().safeParse({
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    level: formData.get("level") ?? undefined,
    maxStudents: formData.get("maxStudents") ? Number(formData.get("maxStudents")) : undefined,
    startDate: formData.get("startDate") ?? undefined,
    endDate: formData.get("endDate") ?? undefined,
  })

  if (!partial.success) return { error: partial.error.flatten().fieldErrors }

  const updateData: Record<string, unknown> = { ...partial.data }
  if (partial.data.level) {
    updateData.tier = getTierFromLevel(partial.data.level)
  }

  const course = await prisma.course.update({
    where: { id: courseId },
    data: updateData,
  })

  revalidatePath("/courses")
  revalidatePath(`/courses/${courseId}`)
  return { success: true, courseId: course.id }
}

export async function deleteCourse(courseId: string) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.course.findUnique({ where: { id: courseId } })
  if (!existing) return { error: "Course not found" }

  if (user.role !== "ADMIN" && existing.instructorId !== user.id) {
    return { error: "Forbidden" }
  }

  await prisma.course.delete({ where: { id: courseId } })

  revalidatePath("/courses")
  return { success: true }
}

export async function publishCourse(courseId: string) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.course.findUnique({ where: { id: courseId } })
  if (!existing) return { error: "Course not found" }

  if (user.role !== "ADMIN" && existing.instructorId !== user.id) {
    return { error: "Forbidden" }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: true },
  })

  revalidatePath("/courses")
  revalidatePath(`/courses/${courseId}`)
  return { success: true }
}
