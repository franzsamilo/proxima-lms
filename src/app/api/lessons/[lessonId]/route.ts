import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateLessonSchema } from "@/lib/validations"

export async function GET(
  request: Request,
  props: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: true },
      },
    },
  })

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  const userRole = session.user.role
  const userId = session.user.id
  const course = lesson.module.course

  // Check access: enrolled student, instructor, or admin
  if (userRole === "STUDENT") {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: userId, courseId: course.id },
      },
    })
    if (!enrollment) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (userRole === "TEACHER" && course.instructorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // For students, include their submission if it exists
  let submission = null
  if (userRole === "STUDENT") {
    submission = await prisma.submission.findUnique({
      where: {
        studentId_lessonId: { studentId: userId, lessonId },
      },
    })
  }

  return NextResponse.json({ ...lesson, submission })
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  if (userRole === "TEACHER" && lesson.module.course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateLessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const updated = await prisma.lesson.update({
    where: { id: lessonId },
    data: parsed.data,
  })

  revalidatePath(`/lessons/${lessonId}`)
  revalidatePath(`/courses/${lesson.module.courseId}`)
  return NextResponse.json(updated)
}
