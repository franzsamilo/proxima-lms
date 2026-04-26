import * as React from "react"
import { cn } from "@/lib/utils"
import { Panel } from "./panel"
import { OrbitalProgress } from "./orbital-progress"

interface TelemetryStatProps {
  label: string
  value: React.ReactNode
  unit?: string
  trend?: { direction: "up" | "down" | "flat"; value: string }
  caption?: string
  progress?: { value: number; max?: number }
  icon?: React.ReactNode
  className?: string
}

export function TelemetryStat({
  label,
  value,
  unit,
  trend,
  caption,
  progress,
  icon,
  className,
}: TelemetryStatProps) {
  return (
    <Panel
      variant="default"
      className={cn(
        "group relative overflow-hidden hover:bg-surface-3/40 transition-colors",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-signal/80 shrink-0">{icon}</span>}
          <span className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-ink-tertiary truncate">
            {label}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-[family-name:var(--font-family-display)] text-[34px] font-bold text-ink-primary leading-none tabular tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
            {unit}
          </span>
        )}
      </div>

      {/* Subline */}
      {(trend || caption) && (
        <div className="mt-2 flex items-center gap-2 font-[family-name:var(--font-family-body)] text-[12px]">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-danger",
                trend.direction === "flat" && "text-ink-tertiary"
              )}
            >
              {trend.direction === "up" && "▲"}
              {trend.direction === "down" && "▼"}
              {trend.direction === "flat" && "—"}
              <span>{trend.value}</span>
            </span>
          )}
          {caption && <span className="text-ink-tertiary">{caption}</span>}
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div className="mt-4">
          <OrbitalProgress value={progress.value} max={progress.max ?? 100} size="sm" />
        </div>
      )}

      {/* Decorative scan line on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
    </Panel>
  )
}
