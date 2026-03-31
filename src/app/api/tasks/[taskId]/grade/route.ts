import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { gradeTaskSchema } from "@/lib/validations"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const submission = await prisma.submission.findUnique({
    where: { id: taskId },
    include: {
      lesson: {
        include: {
          module: {
            include: { course: true },
          },
        },
      },
    },
  })

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 })
  }

  if (
    userRole === "TEACHER" &&
    submission.lesson.module.course.instructorId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = gradeTaskSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const updated = await prisma.submission.update({
    where: { id: taskId },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback,
      status: "GRADED",
      gradedAt: new Date(),
    },
  })

  return NextResponse.json(updated)
}
