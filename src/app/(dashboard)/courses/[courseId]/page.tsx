import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LevelBadge, StatusBadge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ModuleAccordion } from "@/components/courses/module-accordion"

export default async function CourseDetailPage(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              durationMins: true,
              order: true,
            },
          },
        },
      },
      enrollments: {
        select: { id: true, progress: true, studentId: true },
      },
      _count: { select: { enrollments: true } },
    },
  })

  if (!course) notFound()

  const isInstructor = course.instructorId === user.id
  const canEdit = isInstructor || user.role === "ADMIN"

  const enrollment = course.enrollments.find(
    (e) => e.studentId === user.id
  )

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <LevelBadge level={course.level} />
            <StatusBadge
              status={course.isPublished ? "PUBLISHED" : "DRAFT"}
            />
          </div>

          <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-2">
            {course.title}
          </h1>

          <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-secondary mb-3 max-w-2xl">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-tertiary">
            <span>Instructor: {course.instructor.name}</span>
            <span>{course._count.enrollments} enrolled</span>
            <span>
              {course.modules.length}{" "}
              {course.modules.length === 1 ? "module" : "modules"},{" "}
              {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
            </span>
          </div>
        </div>

        {canEdit && (
          <Link href={`/courses/${courseId}/edit`}>
            <Button variant="secondary">
              <Pencil size={14} className="mr-1.5" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Student progress bar */}
      {enrollment && typeof enrollment.progress === "number" && (
        <div className="mb-6 max-w-md">
          <div className="flex items-center justify-between text-[13px] text-ink-secondary mb-1.5">
            <span>Your Progress</span>
            <span className="font-[family-name:var(--font-family-mono)] text-signal">
              {Math.round(enrollment.progress)}%
            </span>
          </div>
          <ProgressBar value={enrollment.progress} thick />
        </div>
      )}

      {/* Module Accordions */}
      <div>
        <h2 className="font-[family-name:var(--font-family-display)] text-[13px] font-bold uppercase tracking-[2px] text-ink-tertiary mb-4">
          Modules
        </h2>
        {course.modules.length === 0 ? (
          <p className="text-[14px] text-ink-tertiary">
            No modules have been added to this course yet.
          </p>
        ) : (
          course.modules.map((mod, idx) => (
            <ModuleAccordion
              key={mod.id}
              module={mod}
              defaultOpen={idx === 0}
            />
          ))
        )}
      </div>
    </div>
  )
}
