import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnnouncementItem {
  id: string
  title: string
  content: string
  priority: string
  createdAt: Date | string
}

interface AnnouncementsPanelProps {
  announcements: AnnouncementItem[]
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

export function AnnouncementsPanel({ announcements }: AnnouncementsPanelProps) {
  return (
    <Card>
      <CardHeader>Announcements</CardHeader>
      {announcements.length === 0 ? (
        <p className="text-[13px] text-ink-tertiary">No announcements yet.</p>
      ) : (
        <div>
          {announcements.map((item, i) => (
            <div
              key={item.id}
              className={
                i < announcements.length - 1
                  ? "pb-3 mb-3 border-b border-edge"
                  : ""
              }
            >
              <p className="font-[family-name:var(--font-family-body)] text-[14px] font-semibold text-ink-primary">
                {item.title}
              </p>
              <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary line-clamp-2 mt-0.5">
                {item.content}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={item.priority === "high" ? "danger" : "neutral"}>
                  {item.priority}
                </Badge>
                <span className="text-[12px] text-ink-tertiary">
                  {relativeTime(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
