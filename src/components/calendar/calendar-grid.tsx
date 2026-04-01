"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: string
}

interface CalendarGridProps {
  events: CalendarEvent[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const eventDotColor: Record<string, string> = {
  deadline: "bg-warning",
  exam: "bg-danger",
  event: "bg-signal",
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function CalendarGrid({ events, currentMonth, onMonthChange }: CalendarGridProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDay = today.getDate()

  const monthName = currentMonth.toLocaleString("en-US", { month: "long" })

  // Build event map: "YYYY-MM-DD" -> event[]
  const eventMap: Record<string, CalendarEvent[]> = {}
  for (const evt of events) {
    const d = new Date(evt.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    if (!eventMap[key]) eventMap[key] = []
    eventMap[key].push(evt)
  }

  function goToPrev() {
    onMonthChange(new Date(year, month - 1, 1))
  }

  function goToNext() {
    onMonthChange(new Date(year, month + 1, 1))
  }

  // Build cell list
  type Cell =
    | { kind: "prev"; day: number }
    | { kind: "current"; day: number }
    | { kind: "next"; day: number }

  const cells: Cell[] = []

  // Prev month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ kind: "prev", day: daysInPrevMonth - i })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ kind: "current", day: d })
  }

  // Next month leading days (fill to complete last row)
  const remainder = cells.length % 7
  if (remainder !== 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      cells.push({ kind: "next", day: d })
    }
  }

  return (
    <div>
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrev}
          className="p-2 rounded-[var(--radius-md)] text-ink-secondary hover:text-ink-primary hover:bg-surface-3 transition-all duration-150 cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>

        <h2 className="font-[family-name:var(--font-family-display)] text-[16px] font-bold text-ink-primary">
          {monthName} {year}
        </h2>

        <button
          onClick={goToNext}
          className="p-2 rounded-[var(--radius-md)] text-ink-secondary hover:text-ink-primary hover:bg-surface-3 transition-all duration-150 cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {DAY_HEADERS.map((h) => (
          <div
            key={h}
            className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium text-ink-ghost uppercase tracking-[1px] text-center py-1"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, idx) => {
          const isCurrentMonth = cell.kind === "current"
          const isToday =
            isCurrentMonth &&
            cell.day === todayDay &&
            month === todayMonth &&
            year === todayYear

          const key = isCurrentMonth
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
            : ""
          const dayEvents = isCurrentMonth && key ? (eventMap[key] ?? []) : []

          return (
            <div
              key={idx}
              className={cn(
                "aspect-square rounded-[var(--radius-md)] relative flex flex-col items-center justify-center transition-colors duration-150 cursor-default",
                isCurrentMonth
                  ? isToday
                    ? "bg-signal-muted"
                    : "hover:bg-surface-3"
                  : "pointer-events-none"
              )}
            >
              <span
                className={cn(
                  "font-[family-name:var(--font-family-body)] text-[13px] leading-none select-none",
                  isToday
                    ? "text-signal font-bold"
                    : isCurrentMonth
                      ? "text-ink-secondary"
                      : "text-ink-ghost opacity-40"
                )}
              >
                {cell.day}
              </span>

              {/* Event dots */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 flex gap-[3px] items-center justify-center">
                  {dayEvents.slice(0, 3).map((evt, di) => (
                    <span
                      key={di}
                      className={cn(
                        "w-[5px] h-[5px] rounded-full",
                        eventDotColor[evt.type] ?? "bg-ink-ghost"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
