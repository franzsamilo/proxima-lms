import Link from "next/link"
import { Card } from "@/components/ui/card"
import { LevelBadge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { BookOpen, GraduationCap, Users } from "lucide-react"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    level: string
    tier: string
    instructor: { name: string }
    modules: { id: string; lessons: { id: string }[] }[]
    enrollments: { id: string; progress?: number; studentId?: string }[]
    _count?: { enrollments: number }
  }
  currentUserId?: string
}

export function CourseCard({ course, currentUserId }: CourseCardProps) {
  const moduleCount = course.modules.length
  const lessonCount = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  )
  const enrollmentCount =
    course._count?.enrollments ?? course.enrollments.length

  const userEnrollment = currentUserId
    ? course.enrollments.find((e) => e.studentId === currentUserId)
    : null

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <Card className="h-full border border-edge hover:border-signal/40 hover:shadow-[var(--shadow-glow)] transition-all duration-200">
        <div className="flex items-center gap-2 mb-3">
          <LevelBadge level={course.level} />
          <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary uppercase tracking-wider">
            {course.tier}
          </span>
        </div>

        <h3 className="font-[family-name:var(--font-family-display)] text-[16px] font-semibold text-ink-primary mb-2 group-hover:text-signal transition-colors">
          {course.title}
        </h3>

        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-[12px] text-ink-tertiary mb-3">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={14} />
            {moduleCount} {moduleCount === 1 ? "module" : "modules"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap size={14} />
            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </span>
        </div>

        {userEnrollment && typeof userEnrollment.progress === "number" && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-ink-tertiary mb-1">
              <span>Progress</span>
              <span>{Math.round(userEnrollment.progress)}%</span>
            </div>
            <ProgressBar value={userEnrollment.progress} />
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-edge">
          <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary">
            {course.instructor.name}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-ink-tertiary">
            <Users size={13} />
            {enrollmentCount}
          </span>
        </div>
      </Card>
    </Link>
  )
}
