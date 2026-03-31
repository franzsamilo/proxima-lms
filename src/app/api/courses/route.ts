import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCourseSchema } from "@/lib/validations"
import { getTierFromLevel } from "@/lib/utils"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const level = searchParams.get("level")
  const search = searchParams.get("search")

  const where: Record<string, unknown> = {}

  if (level) {
    where.level = level
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  const userRole = session.user.role

  if (userRole === "STUDENT") {
    where.enrollments = { some: { studentId: session.user.id } }
  } else if (userRole === "TEACHER") {
    where.instructorId = session.user.id
  }
  // ADMIN sees all

  const courses = await prisma.course.findMany({
    where,
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(courses)
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
  const parsed = createCourseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const course = await prisma.course.create({
    data: {
      ...parsed.data,
      tier: getTierFromLevel(parsed.data.level),
      instructorId: session.user.id,
      isPublished: false,
    },
  })

  return NextResponse.json(course, { status: 201 })
}
