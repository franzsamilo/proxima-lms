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

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        Tasks
      </h1>

      <TasksClient
        submissions={submissions}
        showStudent={isTeacherOrAdmin}
        showCourse={isTeacherOrAdmin}
        activeTab={activeTab}
      />
    </div>
  )
}
