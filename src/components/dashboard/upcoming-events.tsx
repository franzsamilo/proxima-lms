import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface EventItem {
  id: string
  title: string
  date: Date | string
  type: string
}

interface UpcomingEventsProps {
  events: EventItem[]
}

const eventTypeVariant: Record<string, "warning" | "danger" | "info" | "neutral"> = {
  deadline: "warning",
  exam: "danger",
  event: "info",
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Card>
      <CardHeader>Upcoming</CardHeader>
      {events.length === 0 ? (
        <p className="text-[13px] text-ink-tertiary">No upcoming events.</p>
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
              <p className="text-[12px] text-ink-tertiary">
                {formatDate(evt.date)}
              </p>
              <p className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-primary mt-0.5">
                {evt.title}
              </p>
              <div className="mt-1">
                <Badge variant={eventTypeVariant[evt.type] ?? "neutral"}>
                  {evt.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
