import { Panel, PanelHeader } from "@/components/ui/panel"
import { ProtocolBadge } from "@/components/ui/protocol-badge"

interface EventItem {
  id: string
  title: string
  date: Date | string
  type: string
}

interface UpcomingEventsProps {
  events: EventItem[]
}

const eventTone: Record<string, "warning" | "danger" | "info" | "neutral" | "signal"> = {
  deadline: "warning",
  exam: "danger",
  event: "info",
  default: "neutral",
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function formatTimeChip(date: Date | string) {
  const d = new Date(date)
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase()
  return { day: pad(d.getDate()), month }
}

function daysFromNow(date: Date | string) {
  const diff = new Date(date).getTime() - Date.now()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "Today"
  if (days < 0) return `${Math.abs(days)}d ago`
  if (days === 1) return "Tomorrow"
  return `In ${days}d`
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <Panel variant="default" padding="none" className="overflow-hidden">
      <PanelHeader
        title="Upcoming"
        action={
          <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary tabular">
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        }
        divider
        className="px-5 pt-5"
      />
      {events.length === 0 ? (
        <div className="px-5 pb-5">
          <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
            Nothing scheduled.
          </span>
        </div>
      ) : (
        <ul className="divide-y divide-edge">
          {events.map((evt) => {
            const { day, month } = formatTimeChip(evt.date)
            return (
              <li key={evt.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-surface-3/30 transition-colors">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-[6px] border border-edge bg-surface-1 shrink-0">
                  <span className="font-[family-name:var(--font-family-display)] text-[18px] font-bold text-ink-primary tabular leading-none">
                    {day}
                  </span>
                  <span className="font-[family-name:var(--font-family-mono)] text-[9px] tracking-[0.16em] text-signal mt-0.5">
                    {month}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-primary truncate">
                    {evt.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ProtocolBadge tone={eventTone[evt.type] ?? "neutral"}>
                      {evt.type.charAt(0).toUpperCase() + evt.type.slice(1)}
                    </ProtocolBadge>
                    <span className="font-[family-name:var(--font-family-body)] text-[11px] text-signal/80 tabular">
                      {daysFromNow(evt.date)}
                    </span>
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
