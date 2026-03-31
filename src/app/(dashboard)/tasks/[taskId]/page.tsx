import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { TaskDetail } from "@/components/tasks/task-detail"
import { GradingForm } from "@/components/tasks/grading-form"

export default async function TaskDetailPage(props: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await props.params
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const submission = await prisma.submission.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      gradedAt: true,
      grade: true,
      feedback: true,
      codeContent: true,
      videoUrl: true,
      quizAnswers: true,
      fileUrl: true,
      studentId: true,
      lesson: {
        select: {
          title: true,
          type: true,
          module: {
            select: {
              title: true,
              course: {
                select: { title: true },
              },
            },
          },
        },
      },
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!submission) notFound()

  // Students can only see their own submissions
  if (user.role === "STUDENT" && submission.studentId !== user.id) {
    notFound()
  }

  const isTeacherOrAdmin = user.role === "TEACHER" || user.role === "ADMIN"
  const canGrade = isTeacherOrAdmin && submission.status === "SUBMITTED"

  const submissionDetail = {
    id: submission.id,
    status: submission.status,
    submittedAt: submission.submittedAt,
    gradedAt: submission.gradedAt,
    grade: submission.grade,
    feedback: submission.feedback,
    codeContent: submission.codeContent,
    videoUrl: submission.videoUrl,
    quizAnswers: submission.quizAnswers as Record<string, string> | null,
    fileUrl: submission.fileUrl,
    lesson: submission.lesson,
    student: submission.student,
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <TaskDetail submission={submissionDetail} />

      {canGrade && (
        <Card>
          <CardHeader>Grade this Submission</CardHeader>
          <GradingForm submissionId={submission.id} />
        </Card>
      )}
    </div>
  )
}
