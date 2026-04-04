import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { GradeSummaryCards } from "@/components/grades/grade-summary-cards"
import { GradeTable } from "@/components/grades/grade-table"
import { GradeDistributionChart } from "@/components/grades/grade-distribution-chart"
import type { CourseSummary } from "@/components/grades/grade-summary-cards"
import type { GradeRow } from "@/components/grades/grade-table"
import type { GradeDistribution } from "@/components/grades/grade-distribution-chart"

export default async function GradesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Fetch all graded submissions for the current user
  const gradedSubmissions = await prisma.submission.findMany({
    where: {
      studentId: user.id,
      status: "GRADED",
      grade: { not: null },
    },
    orderBy: { gradedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      grade: true,
      feedback: true,
      lesson: {
        select: {
          title: true,
          type: true,
          module: {
            select: {
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // Fetch all enrolled courses with total lesson counts
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          modules: {
            select: {
              lessons: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  })

  // Build grade rows
  const gradeRows: GradeRow[] = gradedSubmissions.map((s) => ({
    id: s.id,
    lessonTitle: s.lesson.title,
    courseTitle: s.lesson.module.course.title,
    lessonType: s.lesson.type,
    submittedAt: s.submittedAt,
    grade: s.grade!,
    feedback: s.feedback,
  }))

  // Build per-course summaries
  const courseGradesMap = new Map<string, number[]>()
  for (const s of gradedSubmissions) {
    const courseId = s.lesson.module.course.id
    if (!courseGradesMap.has(courseId)) courseGradesMap.set(courseId, [])
    courseGradesMap.get(courseId)!.push(s.grade!)
  }

  const courseCompletedMap = new Map<string, number>()
  for (const s of gradedSubmissions) {
    const courseId = s.lesson.module.course.id
    courseCompletedMap.set(courseId, (courseCompletedMap.get(courseId) ?? 0) + 1)
  }

  const summaries: CourseSummary[] = enrollments.map((e) => {
    const { course } = e
    const grades = courseGradesMap.get(course.id) ?? []
    const totalTasks = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    )
    const completedTasks = courseCompletedMap.get(course.id) ?? 0
    const averageGrade =
      grades.length > 0
        ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
        : null

    return {
      courseId: course.id,
      courseTitle: course.title,
      averageGrade,
      completedTasks,
      totalTasks,
    }
  })

  // Build grade distribution
  const distribution: GradeDistribution = { a: 0, b: 0, c: 0, f: 0 }
  for (const row of gradeRows) {
    if (row.grade >= 90) distribution.a++
    else if (row.grade >= 80) distribution.b++
    else if (row.grade >= 70) distribution.c++
    else distribution.f++
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
        Grades
      </h1>

      {/* Course summary cards */}
      <section>
        <h2 className="font-[family-name:var(--font-family-mono)] text-[11px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-4">
          By Course
        </h2>
        <GradeSummaryCards summaries={summaries} />
      </section>

      {/* Grades table + distribution chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 pt-5 pb-0">
              <CardHeader>All Grades</CardHeader>
            </div>
            <GradeTable grades={gradeRows} />
          </Card>
        </div>

        <Card>
          <CardHeader>Grade Distribution</CardHeader>
          <GradeDistributionChart distribution={distribution} />
        </Card>
      </div>
    </div>
  )
}
