import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { Card, CardHeader } from "@/components/ui/card"
import { GradeSummaryCards } from "@/components/grades/grade-summary-cards"
import { GradeTable } from "@/components/grades/grade-table"
import { GradeDistributionChart } from "@/components/grades/grade-distribution-chart"
import { gradeTier } from "@/lib/utils"
import type { CourseSummary } from "@/components/grades/grade-summary-cards"
import type { GradeRow } from "@/components/grades/grade-table"
import type { GradeDistribution } from "@/components/grades/grade-distribution-chart"

const GRADABLE_LESSON_TYPES = ["CODE", "QUIZ", "TASK", "VIDEO"] as const

export default async function GradesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const role = user.role

  // ── Role-aware submission filter ──
  let submissionWhere: Prisma.SubmissionWhereInput
  if (role === "STUDENT") {
    submissionWhere = {
      studentId: user.id,
      status: "GRADED",
      grade: { not: null },
    }
  } else if (role === "TEACHER") {
    submissionWhere = {
      status: "GRADED",
      grade: { not: null },
      lesson: { module: { course: { instructorId: user.id } } },
    }
  } else {
    // ADMIN
    submissionWhere = { status: "GRADED", grade: { not: null } }
  }

  const gradedSubmissions = await prisma.submission.findMany({
    where: submissionWhere,
    orderBy: { gradedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      grade: true,
      feedback: true,
      student: {
        select: { id: true, name: true },
      },
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

  // ── Role-aware course list for summaries ──
  let courseWhere: Prisma.CourseWhereInput
  if (role === "STUDENT") {
    courseWhere = { enrollments: { some: { studentId: user.id } } }
  } else if (role === "TEACHER") {
    courseWhere = { instructorId: user.id }
  } else {
    courseWhere = {}
  }

  const courses = await prisma.course.findMany({
    where: courseWhere,
    select: {
      id: true,
      title: true,
      modules: {
        select: {
          lessons: {
            where: { type: { in: [...GRADABLE_LESSON_TYPES] } },
            select: { id: true },
          },
        },
      },
    },
  })

  // ── Grade rows (include student name for teacher/admin views) ──
  const showStudentColumn = role !== "STUDENT"
  const gradeRows: GradeRow[] = gradedSubmissions.map((s) => ({
    id: s.id,
    lessonTitle: s.lesson.title,
    courseTitle: s.lesson.module.course.title,
    lessonType: s.lesson.type,
    submittedAt: s.submittedAt,
    grade: s.grade!,
    feedback: s.feedback,
    studentName: showStudentColumn ? s.student.name : undefined,
  }))

  // ── Single-pass per-course grades map ──
  const courseGradesMap = new Map<string, number[]>()
  for (const s of gradedSubmissions) {
    const courseId = s.lesson.module.course.id
    const bucket = courseGradesMap.get(courseId)
    if (bucket) {
      bucket.push(s.grade!)
    } else {
      courseGradesMap.set(courseId, [s.grade!])
    }
  }

  const summaries: CourseSummary[] = courses.map((course) => {
    const grades = courseGradesMap.get(course.id) ?? []
    const totalTasks = course.modules.reduce(
      (acc, m) => acc + m.lessons.length,
      0
    )
    const completedTasks = grades.length
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

  // ── Grade distribution via shared gradeTier ──
  const distribution: GradeDistribution = { a: 0, b: 0, c: 0, f: 0 }
  for (const row of gradeRows) {
    distribution[gradeTier(row.grade)]++
  }

  const pageTitle =
    role === "STUDENT"
      ? "My Grades"
      : role === "TEACHER"
        ? "Class Grades"
        : "All Grades"

  const tableTitle =
    role === "STUDENT"
      ? "All Grades"
      : role === "TEACHER"
        ? "Student Submissions"
        : "All Submissions"

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
        {pageTitle}
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
              <CardHeader>{tableTitle}</CardHeader>
            </div>
            <GradeTable grades={gradeRows} showStudent={showStudentColumn} />
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
