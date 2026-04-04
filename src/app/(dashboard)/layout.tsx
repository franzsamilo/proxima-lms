import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const [announcements, events] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, priority: true, createdAt: true },
    }),
    prisma.calendarEvent.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
      select: { id: true, title: true, date: true, type: true },
    }),
  ])

  const notifications = [
    ...announcements.map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.priority === "high" ? "High priority" : "Announcement",
      time: a.createdAt.toISOString(),
      type: "announcement" as const,
    })),
    ...events.map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: e.type.charAt(0).toUpperCase() + e.type.slice(1),
      time: e.date.toISOString(),
      type: "event" as const,
    })),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()).slice(0, 8)

  return (
    <DashboardShell user={JSON.parse(JSON.stringify(user))} notifications={notifications}>
      {children}
    </DashboardShell>
  )
}
