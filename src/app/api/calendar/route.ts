import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createEventSchema } from "@/lib/validations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month") // YYYY-MM

  // Validate ?month=YYYY-MM (regex — reject 2026-13, 2026-AA, etc.)
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json(
      { error: "Invalid month format, expected YYYY-MM" },
      { status: 400 }
    )
  }

  // Get courses the user is associated with
  let courseIds: string[] = []
  const userRole = session.user.role

  if (userRole === "STUDENT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      select: { courseId: true },
    })
    courseIds = enrollments.map((e) => e.courseId)
  } else if (userRole === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { instructorId: session.user.id },
      select: { id: true },
    })
    courseIds = courses.map((c) => c.id)
  }

  const where: Record<string, unknown> = {}

  // Filter by user's courses + null courseId events.
  // Defensive: any non-ADMIN (including undefined/unknown roles) is scoped
  // to their course list + global events. Unknown role with empty courseIds
  // sees only global events.
  if (userRole !== "ADMIN") {
    where.OR = [
      { courseId: null },
      { courseId: { in: courseIds } },
    ]
  }

  // Date range filtering
  if (month) {
    const [year, mon] = month.split("-").map(Number)
    const startDate = new Date(year, mon - 1, 1)
    const endDate = new Date(year, mon, 1)
    where.date = {
      gte: startDate,
      lt: endDate,
    }
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    include: {
      course: { select: { id: true, title: true } },
    },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(events)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole !== "TEACHER" && userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const event = await prisma.calendarEvent.create({
    data: parsed.data,
  })

  return NextResponse.json(event, { status: 201 })
}
