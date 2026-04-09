import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Prisma } from "@prisma/client"
import { CalendarView } from "./calendar-view"

export default async function CalendarPage(props: {
  searchParams: Promise<{ month?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const canCreate = user.role === "TEACHER" || user.role === "ADMIN"

  // Role-based course filter
  let courseFilter: Prisma.CalendarEventWhereInput
  if (user.role === "STUDENT") {
    courseFilter = {
      OR: [
        { courseId: null },
        { course: { enrollments: { some: { studentId: user.id } } } },
      ],
    }
  } else if (user.role === "TEACHER") {
    courseFilter = {
      OR: [{ courseId: null }, { course: { instructorId: user.id } }],
    }
  } else if (user.role === "ADMIN") {
    courseFilter = {}
  } else {
    // Defensive fallback for unknown role — show only global events
    courseFilter = { courseId: null }
  }

  // Validate ?month=YYYY-MM server-side
  const { month } = await props.searchParams
  const monthMatch = month ? /^\d{4}-(0[1-9]|1[0-2])$/.exec(month) : null
  let monthFilter: Prisma.CalendarEventWhereInput = {}
  if (monthMatch) {
    const start = new Date(`${month}-01T00:00:00.000Z`)
    const end = new Date(start)
    end.setUTCMonth(end.getUTCMonth() + 1)
    monthFilter = { date: { gte: start, lt: end } }
  }

  const [rawEvents, courses] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { AND: [courseFilter, monthFilter] },
      orderBy: { date: "asc" },
      select: { id: true, title: true, date: true, type: true },
    }),
    canCreate
      ? prisma.course.findMany({
          where: user.role === "TEACHER" ? { instructorId: user.id } : {},
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

  // Server-truth "today" — YYYY-MM-DD
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  return (
    <CalendarView
      events={events}
      courses={courses}
      canCreate={canCreate}
      today={today}
    />
  )
}
