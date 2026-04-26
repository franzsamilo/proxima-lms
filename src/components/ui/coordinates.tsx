import * as React from "react"
import { cn } from "@/lib/utils"

interface CoordinatesProps extends React.HTMLAttributes<HTMLDivElement> {
  prefix?: string
  segments: (string | number)[]
  separator?: string
}

export function Coordinates({
  prefix,
  segments,
  separator = "·",
  className,
  ...props
}: CoordinatesProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[0.18em] text-ink-tertiary tabular",
        className
      )}
      {...props}
    >
      {prefix && <span className="text-ink-ghost">{prefix}</span>}
      {segments.map((seg, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-ink-ghost/60">{separator}</span>}
          <span className="text-ink-secondary">{seg}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

interface MissionIdProps extends React.HTMLAttributes<HTMLSpanElement> {
  prefix?: string
  id: string
  length?: number
}

export function MissionId({ prefix = "MID", id, length = 6, className, ...props }: MissionIdProps) {
  const short = id.replace(/[^A-Za-z0-9]/g, "").slice(-length).toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-[family-name:var(--font-family-mono)] text-[10px] tracking-[0.12em] tabular",
        className
      )}
      {...props}
    >
      <span className="text-ink-ghost">{prefix}—</span>
      <span className="text-ink-secondary">{short}</span>
    </span>
  )
}
