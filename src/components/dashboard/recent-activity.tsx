import { Card, CardHeader } from "@/components/ui/card"

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
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function CheckSquareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-success shrink-0"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-warning shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function RecentActivity({ submissions }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>Recent Activity</CardHeader>
      {submissions.length === 0 ? (
        <p className="text-[13px] text-ink-tertiary">No recent activity.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const isGraded = sub.status === "GRADED"
            const timestamp = isGraded ? sub.gradedAt : sub.submittedAt
            const description = isGraded
              ? `Graded: ${sub.lesson.title} \u2014 ${sub.grade ?? 0}/100`
              : `Submitted: ${sub.lesson.title}`

            return (
              <div key={sub.id} className="flex items-start gap-3">
                {isGraded ? <CheckSquareIcon /> : <ClockIcon />}
                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary truncate">
                    {description}
                  </p>
                  {timestamp && (
                    <p className="text-[12px] text-ink-tertiary mt-0.5">
                      {relativeTime(timestamp)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
