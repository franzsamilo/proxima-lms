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

  const role = session.user.role
  const userId = session.user.id

  // Explicit allow-list: owner, instructor, or admin only.
  const isOwner = submission.studentId === userId
  const isInstructor =
    submission.lesson.module.course.instructorId === userId
  const isAdmin = role === "ADMIN"

  if (!isOwner && !isInstructor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(submission)
}
