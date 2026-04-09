import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { submitTaskSchema, tasksQuerySchema } from "@/lib/validations"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = tasksQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    courseId: searchParams.get("courseId") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  const { status, courseId } = parsed.data

  const where: Prisma.SubmissionWhereInput = {}
  if (status) where.status = status

  const role = session.user.role
  if (role === "STUDENT") {
    where.studentId = session.user.id
  } else if (role === "TEACHER") {
    where.lesson = {
      module: {
        course: {
          instructorId: session.user.id,
          ...(courseId ? { id: courseId } : {}),
        },
      },
    }
  } else if (role === "ADMIN") {
    if (courseId) {
      where.lesson = { module: { course: { id: courseId } } }
    }
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      lesson: { select: { id: true, title: true, type: true } },
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: [
      { submittedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  })

  return NextResponse.json(submissions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can submit tasks" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = submitTaskSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Verify student is enrolled in the course containing this lesson
  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    include: { module: { include: { course: true } } },
  })

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: session.user.id,
        courseId: lesson.module.course.id,
      },
    },
  })

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 })
  }

  // Build type-aware data payload. Any stale grade is explicitly cleared
  // on every (re)submit so the submission returns to a clean SUBMITTED cycle.
  const data: Prisma.SubmissionUncheckedCreateInput = {
    studentId: session.user.id,
    lessonId: parsed.data.lessonId,
    status: "SUBMITTED",
    submittedAt: new Date(),
    grade: null,
    gradedAt: null,
    feedback: null,
    codeContent: null,
    videoUrl: null,
    quizAnswers: Prisma.JsonNull,
    fileUrl: null,
  }

  if (lesson.type === "CODE") {
    data.codeContent = parsed.data.codeContent ?? null
  } else if (lesson.type === "VIDEO") {
    data.videoUrl = parsed.data.videoUrl ?? null
  } else if (lesson.type === "QUIZ") {
    data.quizAnswers = (parsed.data.quizAnswers ?? Prisma.JsonNull) as Prisma.InputJsonValue
  } else if (lesson.type === "TASK") {
    // TASK lessons accept code and/or video and/or a file attachment
    data.codeContent = parsed.data.codeContent ?? null
    data.videoUrl = parsed.data.videoUrl ?? null
    data.fileUrl = parsed.data.fileUrl ?? null
  } else {
    return NextResponse.json(
      { error: "Lesson type does not accept submissions" },
      { status: 400 }
    )
  }

  const submission = await prisma.submission.upsert({
    where: {
      studentId_lessonId: {
        studentId: session.user.id,
        lessonId: parsed.data.lessonId,
      },
    },
    create: data,
    update: data,
  })

  return NextResponse.json(submission, { status: 201 })
}
