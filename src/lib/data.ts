import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

/**
 * React `cache()` dedupes these calls within a single request render,
 * so layout + page + components hitting the same data only roundtrip once.
 */

export const getSessionUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      department: true,
      schoolLevel: true,
    },
  })
})

export const getRecentAnnouncements = cache(async (limit = 5) => {
  return prisma.announcement.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: { id: true, title: true, content: true, priority: true, createdAt: true },
  })
})

export const getUpcomingEvents = cache(async (limit = 5) => {
  return prisma.calendarEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: limit,
    select: { id: true, title: true, date: true, type: true },
  })
})
