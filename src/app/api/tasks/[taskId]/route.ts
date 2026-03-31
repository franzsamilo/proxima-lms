import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  props: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const submission = await prisma.submission.findUnique({
    where: { id: taskId },
    include: {
      student: { select: { id: true, name: true, email: true } },
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

  const userRole = session.user.role
  const userId = session.user.id

  // Owner, instructor, or admin
  if (userRole === "STUDENT" && submission.studentId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (
    userRole === "TEACHER" &&
    submission.lesson.module.course.instructorId !== userId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(submission)
}
