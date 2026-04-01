import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CalendarView } from "./calendar-view"

export default async function CalendarPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const canCreate = user.role === "TEACHER" || user.role === "ADMIN"

  const [rawEvents, courses] = await Promise.all([
    prisma.calendarEvent.findMany({
      orderBy: { date: "asc" },
      select: { id: true, title: true, date: true, type: true },
    }),
    canCreate
      ? prisma.course.findMany({
          orderBy: { title: "asc" },
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
  ])

  // Serialize dates to ISO strings for client components
  const events = rawEvents.map((evt) => ({
    ...evt,
    date: evt.date.toISOString(),
  }))

  return (
    <CalendarView
      events={events}
      courses={courses}
      canCreate={canCreate}
    />
  )
}
