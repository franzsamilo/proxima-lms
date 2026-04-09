"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(100),
  content: z.string().min(1),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
})

export async function createAnnouncement(formData: FormData) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const parsed = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: (formData.get("priority") as string)?.toUpperCase() ?? "NORMAL",
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
