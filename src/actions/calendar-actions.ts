"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createEventSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    type: formData.get("type"),
    courseId: formData.get("courseId") ?? undefined,
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const event = await prisma.calendarEvent.create({
    data: {
      title: parsed.data.title,
      date: parsed.data.date,
      type: parsed.data.type,
      courseId: parsed.data.courseId,
    },
  })

  revalidatePath("/calendar")
  return { success: true, eventId: event.id }
}

export async function deleteEvent(eventId: string) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } })
  if (!existing) return { error: "Event not found" }

  await prisma.calendarEvent.delete({ where: { id: eventId } })

  revalidatePath("/calendar")
  return { success: true }
}
