import Link from "next/link"
import { Clock, Presentation, Code, HelpCircle, ClipboardList, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"

const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; badge: BadgeVariant; label: string }
> = {
  SLIDES: {
    icon: Presentation,
    color: "bg-info-tint text-info",
    badge: "info",
    label: "Slides",
  },
  CODE: {
    icon: Code,
    color: "bg-purple-tint text-purple",
    badge: "purple",
    label: "Code",
  },
  QUIZ: {
    icon: HelpCircle,
    color: "bg-warning-tint text-warning",
    badge: "warning",
    label: "Quiz",
  },
  TASK: {
    icon: ClipboardList,
    color: "bg-success-tint text-success",
    badge: "success",
    label: "Task",
  },
  VIDEO: {
    icon: Video,
    color: "bg-danger-tint text-danger",
    badge: "danger",
    label: "Video",
  },
}

interface LessonItemProps {
  lesson: {
    id: string
    title: string
    type: string
    durationMins: number
  }
}

export function LessonItem({ lesson }: LessonItemProps) {
  const config = typeConfig[lesson.type] ?? typeConfig.SLIDES
  const Icon = config.icon

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="flex items-center h-12 pl-14 pr-4 hover:bg-surface-3/50 transition-colors group"
    >
      <div
        className={`w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${config.color}`}
      >
        <Icon size={14} />
      </div>

      <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary ml-3 flex-1 truncate group-hover:text-signal transition-colors">
        {lesson.title}
      </span>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Badge variant={config.badge}>{config.label}</Badge>
        <span className="inline-flex items-center gap-1 font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">
          <Clock size={12} />
          {lesson.durationMins}m
        </span>
      </div>
    </Link>
  )
}
