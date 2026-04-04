import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TasksClient } from "@/components/tasks/tasks-client"
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

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        Tasks
      </h1>

      <TasksClient submissions={submissions} showStudent={isTeacherOrAdmin} />
    </div>
  )
}
