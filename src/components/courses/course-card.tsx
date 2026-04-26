import Link from "next/link"
import { Panel } from "@/components/ui/panel"
import { LevelTag, ProtocolBadge } from "@/components/ui/protocol-badge"
import { OrbitalProgress } from "@/components/ui/orbital-progress"
import { BookOpen, GraduationCap, Users, ArrowUpRight } from "lucide-react"

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
  const lessonCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const enrollmentCount = course._count?.enrollments ?? course.enrollments.length

  const userEnrollment = currentUserId
    ? course.enrollments.find((e) => e.studentId === currentUserId)
    : null
  const progress = userEnrollment?.progress ?? null

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <Panel
        bracket
        variant="default"
        className="h-full flex flex-col gap-4 hover:bg-surface-3/40 hover:shadow-[0_0_36px_var(--color-signal-glow)] transition-all"
      >
        {/* Header line */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <LevelTag level={course.level} />
            <ProtocolBadge tone="neutral">{course.tier.charAt(0) + course.tier.slice(1).toLowerCase()}</ProtocolBadge>
          </div>
          <ArrowUpRight
            size={16}
            className="text-ink-ghost shrink-0 transition-all group-hover:text-signal group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>

        {/* Title block */}
        <h3 className="font-[family-name:var(--font-family-display)] text-[18px] font-semibold text-ink-primary tracking-tight leading-tight group-hover:text-signal transition-colors">
          {course.title}
        </h3>

        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<BookOpen size={11} />} label="Modules" value={moduleCount} />
          <Stat icon={<GraduationCap size={11} />} label="Lessons" value={lessonCount} />
          <Stat icon={<Users size={11} />} label="Students" value={enrollmentCount} />
        </div>

        {/* Progress (student only) */}
        {progress !== null && (
          <OrbitalProgress
            value={progress}
            label="Progress"
            showValue
            size="sm"
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-edge">
          <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary truncate">
            By {course.instructor.name}
          </span>
        </div>
      </Panel>
    </Link>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex flex-col gap-1 px-2 py-2 bg-surface-1 border border-edge rounded-[4px]">
      <div className="flex items-center gap-1 text-ink-ghost">
        {icon}
        <span className="font-[family-name:var(--font-family-body)] text-[10px] text-ink-tertiary">{label}</span>
      </div>
      <span className="font-[family-name:var(--font-family-display)] text-[18px] font-bold text-ink-primary tabular leading-none">
        {value}
      </span>
    </div>
  )
}
