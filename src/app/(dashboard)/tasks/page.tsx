import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { TaskTable } from "@/components/tasks/task-table"
import type { TaskRow } from "@/components/tasks/task-table"

async function getSubmissions(userId: string, role: string) {
  const select = {
    id: true,
    status: true,
    submittedAt: true,
    grade: true,
    lesson: {
      select: {
        title: true,
        type: true,
      },
    },
    student: {
      select: {
        name: true,
      },
    },
  }

  if (role === "STUDENT") {
    return prisma.submission.findMany({
      where: { studentId: userId, status: { not: "DRAFT" } },
      orderBy: { submittedAt: "desc" },
      select,
    })
  }

  if (role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true },
    })
    const courseIds = courses.map((c) => c.id)

    return prisma.submission.findMany({
      where: {
        status: { not: "DRAFT" },
        lesson: { module: { courseId: { in: courseIds } } },
      },
      orderBy: { submittedAt: "desc" },
      select,
    })
  }

  // ADMIN
  return prisma.submission.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { submittedAt: "desc" },
    select,
  })
}

export default async function TasksPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const rawSubmissions = await getSubmissions(user.id, user.role)

  const submissions: TaskRow[] = rawSubmissions.map((s) => ({
    id: s.id,
    lessonTitle: s.lesson.title,
    studentName: s.student.name,
    lessonType: s.lesson.type,
    status: s.status,
    submittedAt: s.submittedAt,
    grade: s.grade,
  }))

  const isTeacherOrAdmin = user.role === "TEACHER" || user.role === "ADMIN"

  const tabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Graded", value: "graded" },
  ]

  function filterSubmissions(activeTab: string) {
    if (activeTab === "pending") return submissions.filter((s) => s.status === "SUBMITTED")
    if (activeTab === "graded") return submissions.filter((s) => s.status === "GRADED")
    return submissions
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        Tasks
      </h1>

      <Card className="p-0 overflow-hidden">
        <div className="p-5">
          <Tabs tabs={tabs} defaultValue="all">
            {(activeTab) => (
              <TaskTable
                submissions={filterSubmissions(activeTab)}
                showStudent={isTeacherOrAdmin}
              />
            )}
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
