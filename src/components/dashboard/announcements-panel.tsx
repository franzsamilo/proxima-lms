import { Panel, PanelHeader } from "@/components/ui/panel"
import { PriorityTag } from "@/components/ui/protocol-badge"
import { RelativeTime } from "@/components/ui/relative-time"
import { Megaphone } from "lucide-react"
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

export function AnnouncementsPanel({ announcements }: AnnouncementsPanelProps) {
  return (
    <Panel variant="default" padding="none" className="overflow-hidden">
      <PanelHeader
        title="Announcements"
        action={
          <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary tabular">
            {announcements.length} {announcements.length === 1 ? "post" : "posts"}
          </span>
        }
        divider
        className="px-5 pt-5"
      />
      {announcements.length === 0 ? (
        <div className="px-5 pb-5 flex items-center gap-3 text-ink-tertiary">
          <Megaphone size={14} />
          <span className="font-[family-name:var(--font-family-body)] text-[13px]">No announcements yet.</span>
        </div>
      ) : (
        <ul className="divide-y divide-edge">
          {announcements.map((item) => (
            <li
              key={item.id}
              id={`announcement-${item.id}`}
              className="group relative flex gap-4 px-5 py-4 hover:bg-surface-3/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary leading-snug truncate">
                    {item.title}
                  </h4>
                  <PriorityTag priority={item.priority} />
                </div>
                <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary leading-relaxed line-clamp-2 mb-2">
                  {item.content}
                </p>
                <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
                  <RelativeTime iso={typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString()} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
