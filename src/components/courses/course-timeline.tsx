"use client"

import { cn } from "@/lib/utils"

interface CourseTimelineProps {
  startDate: Date
  endDate: Date
  modules: { title: string; status: string }[]
}

export function CourseTimeline({ startDate, endDate, modules }: CourseTimelineProps) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  const totalDuration = end - start

  const todayPercent = totalDuration > 0
    ? Math.max(0, Math.min(100, ((now - start) / totalDuration) * 100))
    : 0

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const points = [
    { label: "Start", date: startDate, percent: 0, active: true },
    ...modules.map((mod, i) => ({
      label: mod.title,
      date: null as Date | null,
      percent: ((i + 1) / (modules.length + 1)) * 100,
      active: mod.status === "PUBLISHED",
    })),
    { label: "End", date: endDate, percent: 100, active: false },
  ]

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:block relative py-6">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-edge -translate-y-1/2" />

        {/* Today marker */}
        {todayPercent > 0 && todayPercent < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-signal shadow-[0_0_8px_var(--color-signal-glow)] z-10"
            style={{ left: `${todayPercent}%`, marginLeft: "-6px" }}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-[family-name:var(--font-family-mono)] text-[9px] text-signal whitespace-nowrap">
              TODAY
            </span>
          </div>
        )}

        {/* Points */}
        <div className="relative flex justify-between">
          {points.map((point, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ width: 0, position: "absolute", left: `${point.percent}%` }}
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 -translate-x-1/2",
                  point.active
                    ? "bg-signal border-signal"
                    : "bg-edge-strong border-edge-strong"
                )}
              />
              <span
                className={cn(
                  "font-[family-name:var(--font-family-body)] text-[11px] mt-2 whitespace-nowrap -translate-x-1/2",
                  i % 2 === 0 ? "mt-2" : "-mt-8",
                  point.active ? "text-ink-secondary" : "text-ink-tertiary"
                )}
              >
                {point.label}
              </span>
              {point.date && (
                <span
                  className={cn(
                    "font-[family-name:var(--font-family-mono)] text-[9px] text-ink-ghost -translate-x-1/2",
                    i % 2 === 0 ? "mt-0.5" : "-mt-3"
                  )}
                >
                  {formatDate(point.date)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden relative pl-6 py-2">
        {/* Vertical track */}
        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-edge" />

        {points.map((point, i) => (
          <div key={i} className="relative flex items-start gap-3 mb-4 last:mb-0">
            <div
              className={cn(
                "absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full border-2 shrink-0",
                point.active
                  ? "bg-signal border-signal"
                  : "bg-edge-strong border-edge-strong"
              )}
            />
            <div>
              <span
                className={cn(
                  "font-[family-name:var(--font-family-body)] text-[12px]",
                  point.active ? "text-ink-secondary" : "text-ink-tertiary"
                )}
              >
                {point.label}
              </span>
              {point.date && (
                <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost ml-2">
                  {formatDate(point.date)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
