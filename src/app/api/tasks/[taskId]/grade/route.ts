import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { gradeTaskSchema } from "@/lib/validations"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await props.params

  try {
    await requireRole(["TEACHER", "ADMIN"])
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Forbidden"
    const status = msg === "Unauthorized" ? 401 : 403
    return NextResponse.json({ error: msg }, { status })
  }

  const session = await auth()
  const userRole = session!.user.role
  const userId = session!.user.id

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
    submission.lesson.module.course.instructorId !== userId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (submission.status === "GRADED") {
    return NextResponse.json({ error: "Already graded" }, { status: 409 })
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

  revalidatePath("/tasks")
  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/grades")
  revalidatePath("/courses")
  revalidatePath("/dashboard")

  return NextResponse.json(updated)
}
