import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
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
  })

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  // Check access: enrolled student, instructor, or admin
  const userRole = session.user.role
  const userId = session.user.id

  if (userRole === "STUDENT") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
    })
    if (!enrollment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (userRole === "TEACHER" && course.instructorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(course)
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  const userRole = session.user.role
  if (userRole === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (userRole === "TEACHER" && course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const updated = await prisma.course.update({
    where: { id: courseId },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  const userRole = session.user.role
  if (userRole === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (userRole === "TEACHER" && course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.course.delete({ where: { id: courseId } })

  return NextResponse.json({ success: true })
}
