"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createEventSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const rawCourseId = formData.get("courseId")
  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    type: formData.get("type"),
    courseId: rawCourseId === null ? undefined : String(rawCourseId),
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Teachers can only attach events to courses they instruct.
  if (parsed.data.courseId && user.role === "TEACHER") {
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { instructorId: true },
    })
    if (!course || course.instructorId !== user.id) {
      return { error: { courseId: ["You cannot add events to this course."] } }
    }
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title: parsed.data.title,
      date: parsed.data.date,
      type: parsed.data.type,
      courseId: parsed.data.courseId,
    },
  })

  revalidatePath("/calendar")
  revalidatePath("/dashboard")
  return { success: true, eventId: event.id }
}

export async function deleteEvent(eventId: string) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    include: { course: { select: { instructorId: true } } },
  })
  if (!existing) return { error: "Event not found" }

  // Per-event authorization:
  // - Global (courseId: null) events: admin-only.
  // - Course events: admin OR the course's instructor.
  if (existing.courseId) {
    if (user.role !== "ADMIN" && existing.course?.instructorId !== user.id) {
      return { error: "Forbidden" }
    }
  } else {
    if (user.role !== "ADMIN") {
      return { error: "Forbidden" }
    }
  }

  await prisma.calendarEvent.delete({ where: { id: eventId } })

  revalidatePath("/calendar")
  revalidatePath("/dashboard")
  return { success: true }
}
