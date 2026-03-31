import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can enroll" }, { status: 403 })
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { _count: { select: { enrollments: true } } },
  })

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  // Check maxStudents
  if (course._count.enrollments >= course.maxStudents) {
    return NextResponse.json({ error: "Course is full" }, { status: 400 })
  }

  // Check duplicate enrollment
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId: session.user.id, courseId },
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: session.user.id,
      courseId,
      progress: 0,
    },
  })

  return NextResponse.json(enrollment, { status: 201 })
}
