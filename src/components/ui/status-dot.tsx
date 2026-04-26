import * as React from "react"
import { cn } from "@/lib/utils"

export type DotStatus = "live" | "warn" | "danger" | "idle"

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: DotStatus
}

export function StatusDot({ status = "live", className, ...props }: StatusDotProps) {
  return (
    <span
      className={cn(
        "status-dot",
        status === "warn" && "warn",
        status === "danger" && "danger",
        status === "idle" && "idle",
        className
      )}
      {...props}
    />
  )
}

interface StatusPipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: DotStatus
  label: string
}

export function StatusPip({ status = "live", label, className, ...props }: StatusPipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[0.18em] tabular",
        status === "live" && "text-signal",
        status === "warn" && "text-warning",
        status === "danger" && "text-danger",
        status === "idle" && "text-ink-tertiary",
        className
      )}
      {...props}
    >
      <StatusDot status={status} />
      {label}
    </span>
  )
}
