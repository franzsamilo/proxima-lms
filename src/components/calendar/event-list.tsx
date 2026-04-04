"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { deleteEvent } from "@/actions/calendar-actions"

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: string
}

interface EventListProps {
  events: CalendarEvent[]
  canDelete?: boolean
}

const eventTypeBadgeVariant: Record<string, "warning" | "danger" | "info"> = {
  deadline: "warning",
  exam: "danger",
  event: "info",
}

export function EventList({ events, canDelete = false }: EventListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(eventId: string) {
    setDeletingId(eventId)
    await deleteEvent(eventId)
    setDeletingId(null)
  }

  return (
    <Card>
      <CardHeader>Events</CardHeader>
      {events.length === 0 ? (
        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
          No events this month.
        </p>
      ) : (
        <div>
          {events.map((evt, i) => (
            <div
              key={evt.id}
              className={
                i < events.length - 1
                  ? "pb-3 mb-3 border-b border-edge"
                  : ""
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary mb-0.5">
                    {formatDate(evt.date)}
                  </p>
                  <p className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-primary mb-1.5">
                    {evt.title}
                  </p>
                  <Badge variant={eventTypeBadgeVariant[evt.type] ?? "neutral"}>
                    {evt.type}
                  </Badge>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(evt.id)}
                    disabled={deletingId === evt.id}
                    className="p-1.5 text-ink-ghost hover:text-danger hover:bg-danger-tint rounded-[var(--radius-sm)] transition-colors shrink-0 disabled:opacity-50"
                    aria-label={`Delete ${evt.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
