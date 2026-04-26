import { Panel, PanelHeader } from "@/components/ui/panel"
import { ProtocolBadge } from "@/components/ui/protocol-badge"
import { CheckCircle2, Clock, FileCode2, Video, BookOpen, ListChecks } from "lucide-react"

interface SubmissionItem {
  id: string
  status: string
  grade?: number | null
  lesson: { title: string; type: string }
  submittedAt?: Date | string | null
  gradedAt?: Date | string | null
}

interface RecentActivityProps {
  submissions: SubmissionItem[]
}

function relativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

const typeIcons: Record<string, typeof FileCode2> = {
  CODE: FileCode2,
  VIDEO: Video,
  SLIDES: BookOpen,
  QUIZ: ListChecks,
  TASK: FileCode2,
  DOCUMENT: BookOpen,
}

export function RecentActivity({ submissions }: RecentActivityProps) {
  return (
    <Panel variant="default" padding="none" className="overflow-hidden">
      <PanelHeader
        title="Recent Activity"
        divider
        className="px-5 pt-5"
      />
      {submissions.length === 0 ? (
        <div className="px-5 pb-5 flex items-center gap-3 text-ink-tertiary">
          <Clock size={14} />
          <span className="font-[family-name:var(--font-family-body)] text-[13px]">No recent activity.</span>
        </div>
      ) : (
        <ul className="relative">
          {/* Vertical timeline rail */}
          <div className="absolute left-[42px] top-2 bottom-2 w-px bg-gradient-to-b from-edge via-edge to-transparent" />
          {submissions.map((sub) => {
            const isGraded = sub.status === "GRADED"
            const timestamp = isGraded ? sub.gradedAt : sub.submittedAt
            const TypeIcon = typeIcons[sub.lesson.type] ?? FileCode2

            return (
              <li key={sub.id} className="relative px-5 py-3 flex items-start gap-4 hover:bg-surface-3/30 transition-colors">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 mt-1 w-6 h-6 rounded border flex items-center justify-center shrink-0 ${
                    isGraded
                      ? "bg-success-tint border-success/40 text-success"
                      : "bg-warning-tint border-warning/40 text-warning"
                  }`}
                >
                  {isGraded ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary truncate">
                        <span className="text-ink-tertiary mr-1.5">
                          {isGraded ? "Graded:" : "Submitted:"}
                        </span>
                        {sub.lesson.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
                          <TypeIcon size={10} />
                          {sub.lesson.type.charAt(0) + sub.lesson.type.slice(1).toLowerCase()}
                        </span>
                        {timestamp && (
                          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
                            {relativeTime(timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                    {isGraded && sub.grade != null && (
                      <ProtocolBadge tone={sub.grade >= 90 ? "success" : sub.grade >= 70 ? "info" : "warning"}>
                        {sub.grade}/100
                      </ProtocolBadge>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
