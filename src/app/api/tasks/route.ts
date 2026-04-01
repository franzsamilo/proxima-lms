import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { submitTaskSchema } from "@/lib/validations"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const courseId = searchParams.get("courseId")

  const where: Record<string, unknown> = {}

  if (status) {
    where.status = status
  }

  const userRole = session.user.role

  if (userRole === "STUDENT") {
    where.studentId = session.user.id
  } else if (userRole === "TEACHER") {
    where.lesson = {
      module: {
        course: {
          instructorId: session.user.id,
          ...(courseId ? { id: courseId } : {}),
        },
      },
    }
  } else if (courseId) {
    // Admin with courseId filter
    where.lesson = {
      module: {
        course: { id: courseId },
      },
    }
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      lesson: { select: { id: true, title: true, type: true } },
      student: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
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

  // Upsert on [studentId, lessonId]
  const submission = await prisma.submission.upsert({
    where: {
      studentId_lessonId: {
        studentId: session.user.id,
        lessonId: parsed.data.lessonId,
      },
    },
    update: {
      codeContent: parsed.data.codeContent,
      videoUrl: parsed.data.videoUrl,
      quizAnswers: (parsed.data.quizAnswers ?? undefined) as Prisma.InputJsonValue | undefined,
      fileUrl: parsed.data.fileUrl,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      studentId: session.user.id,
      lessonId: parsed.data.lessonId,
      codeContent: parsed.data.codeContent,
      videoUrl: parsed.data.videoUrl,
      quizAnswers: (parsed.data.quizAnswers ?? undefined) as Prisma.InputJsonValue | undefined,
      fileUrl: parsed.data.fileUrl,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  })

  return NextResponse.json(submission, { status: 201 })
}
