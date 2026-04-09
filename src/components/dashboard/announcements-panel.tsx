import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RelativeTime } from "@/components/ui/relative-time"
import type { AnnouncementPriority } from "@prisma/client"

interface AnnouncementItem {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  createdAt: Date | string
}

interface AnnouncementsPanelProps {
  announcements: AnnouncementItem[]
}

const priorityBadgeVariant: Record<AnnouncementPriority, "danger" | "info" | "neutral"> = {
  HIGH: "danger",
  NORMAL: "info",
  LOW: "neutral",
}

const priorityLabel: Record<AnnouncementPriority, string> = {
  HIGH: "High",
  NORMAL: "Normal",
  LOW: "Low",
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
                <Badge variant={priorityBadgeVariant[item.priority]}>
                  {priorityLabel[item.priority]}
                </Badge>
                <span className="text-[12px] text-ink-tertiary">
                  <RelativeTime iso={typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString()} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
