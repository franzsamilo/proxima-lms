"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createAnnouncementSchema } from "@/lib/validations"

export async function createAnnouncement(formData: FormData) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const parsed = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority") ?? "NORMAL",
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const announcement = await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      priority: parsed.data.priority,
      authorId: user.id,
    },
  })

  revalidatePath("/dashboard")
  return { success: true, announcementId: announcement.id }
}
