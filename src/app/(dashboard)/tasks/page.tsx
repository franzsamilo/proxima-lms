import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TasksClient } from "@/components/tasks/tasks-client"
import type { TaskRow } from "@/components/tasks/task-table"
import type { Prisma } from "@prisma/client"

type Tab = "all" | "pending" | "graded"

export default async function TasksPage(props: {
  searchParams: Promise<{ tab?: string; courseId?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { tab } = await props.searchParams
  const activeTab: Tab =
    tab === "pending" || tab === "graded" ? tab : "all"

  const where: Prisma.SubmissionWhereInput = {}
  if (user.role === "STUDENT") {
    where.studentId = user.id
  } else if (user.role === "TEACHER") {
    where.lesson = { module: { course: { instructorId: user.id } } }
  }
  // ADMIN: no additional scoping.

  if (activeTab === "pending") {
    where.status = { in: ["DRAFT", "SUBMITTED"] }
  } else if (activeTab === "graded") {
    where.status = "GRADED"
  }
  // "all" → no status filter; DRAFT submissions now visible to students.

  const rawSubmissions = await prisma.submission.findMany({
    where,
    orderBy: [
      { submittedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      status: true,
      submittedAt: true,
      grade: true,
      lesson: {
        select: {
          title: true,
          type: true,
          module: {
            select: {
              course: { select: { title: true } },
            },
          },
        },
      },
      student: { select: { name: true } },
    },
  })

  const submissions: TaskRow[] = rawSubmissions.map((s) => ({
    id: s.id,
    lessonTitle: s.lesson.title,
    studentName: s.student.name,
    lessonType: s.lesson.type,
    courseTitle: s.lesson.module.course.title,
    status: s.status,
    submittedAt: s.submittedAt,
    grade: s.grade,
  }))

  const isTeacherOrAdmin = user.role === "TEACHER" || user.role === "ADMIN"

  const pendingCount = submissions.filter(s => s.status !== "GRADED").length
  const gradedCount = submissions.filter(s => s.status === "GRADED").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-family-display)] text-[28px] md:text-[36px] font-bold tracking-tight text-ink-primary leading-[1.05]">
          {isTeacherOrAdmin ? "Submissions" : "Tasks"}
        </h1>
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary max-w-2xl">
          {isTeacherOrAdmin
            ? `Review, grade, and return student submissions. ${pendingCount} pending, ${gradedCount} graded.`
            : `Track your work across all enrolled courses. ${pendingCount} pending, ${gradedCount} graded.`}
        </p>
      </div>

      <TasksClient
        submissions={submissions}
        showStudent={isTeacherOrAdmin}
        showCourse={isTeacherOrAdmin}
        activeTab={activeTab}
      />
    </div>
  )
}
