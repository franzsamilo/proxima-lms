import * as React from "react"
import { cn } from "@/lib/utils"
import type { SchoolLevel, SubmissionStatus, ModuleStatus, AnnouncementPriority } from "@prisma/client"

type Tone = "signal" | "success" | "warning" | "danger" | "info" | "purple" | "neutral" | "plasma"

interface ProtocolBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  bracket?: boolean
  dot?: boolean
}

const toneMap: Record<Tone, { bg: string; text: string; border: string; dot: string }> = {
  signal: { bg: "bg-signal-muted", text: "text-signal", border: "border-signal/30", dot: "bg-signal" },
  success: { bg: "bg-success-tint", text: "text-success", border: "border-success/30", dot: "bg-success" },
  warning: { bg: "bg-warning-tint", text: "text-warning", border: "border-warning/30", dot: "bg-warning" },
  danger: { bg: "bg-danger-tint", text: "text-danger", border: "border-danger/30", dot: "bg-danger" },
  info: { bg: "bg-info-tint", text: "text-info", border: "border-info/30", dot: "bg-info" },
  purple: { bg: "bg-purple-tint", text: "text-purple", border: "border-purple/30", dot: "bg-purple" },
  plasma: { bg: "bg-plasma-muted", text: "text-plasma", border: "border-plasma/30", dot: "bg-plasma" },
  neutral: { bg: "bg-surface-3", text: "text-ink-tertiary", border: "border-edge", dot: "bg-ink-tertiary" },
}

export const ProtocolBadge = React.forwardRef<HTMLSpanElement, ProtocolBadgeProps>(
  ({ className, tone = "neutral", bracket = false, dot = false, children, ...props }, ref) => {
    const t = toneMap[tone]
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] border font-[family-name:var(--font-family-mono)] text-[10px] font-semibold tracking-[0.12em] uppercase tabular leading-none h-5",
          t.bg,
          t.text,
          t.border,
          className
        )}
        {...props}
      >
        {bracket && <span className="opacity-60">[</span>}
        {dot && <span className={cn("inline-block w-1.5 h-1.5 rounded-full", t.dot)} />}
        <span className="leading-none">{children}</span>
        {bracket && <span className="opacity-60">]</span>}
      </span>
    )
  }
)
ProtocolBadge.displayName = "ProtocolBadge"

/* Convenience wrappers */

const levelTone: Record<string, Tone> = {
  ELEMENTARY: "success",
  HS: "info",
  COLLEGE: "purple",
}
const levelLabel: Record<string, string> = {
  ELEMENTARY: "ELEM",
  HS: "HIGH SCHOOL",
  COLLEGE: "COLLEGE",
}

export function LevelTag({ level, ...rest }: { level: SchoolLevel | string } & Omit<ProtocolBadgeProps, "tone" | "children">) {
  return (
    <ProtocolBadge tone={levelTone[level] ?? "neutral"} {...rest}>
      {levelLabel[level] ?? level}
    </ProtocolBadge>
  )
}

const statusTone: Record<string, Tone> = {
  GRADED: "success", PUBLISHED: "success", COMPLETED: "success", ACTIVE: "success", IN_STOCK: "success",
  SUBMITTED: "warning", PENDING: "warning", LOW_STOCK: "warning", LATE: "warning",
  DRAFT: "neutral", LOCKED: "neutral", NOT_STARTED: "neutral", INACTIVE: "neutral", ARCHIVED: "neutral",
  IN_PROGRESS: "info",
  MISSING: "danger", OUT_OF_STOCK: "danger", RETURNED: "danger",
}

export function StatusTag({ status, ...rest }: { status: SubmissionStatus | ModuleStatus | string } & Omit<ProtocolBadgeProps, "tone" | "children">) {
  return (
    <ProtocolBadge tone={statusTone[status] ?? "neutral"} dot {...rest}>
      {String(status).replace(/_/g, " ")}
    </ProtocolBadge>
  )
}

const priorityTone: Record<string, Tone> = {
  HIGH: "danger",
  NORMAL: "signal",
  LOW: "neutral",
}

export function PriorityTag({ priority, ...rest }: { priority: AnnouncementPriority | string } & Omit<ProtocolBadgeProps, "tone" | "children">) {
  return (
    <ProtocolBadge tone={priorityTone[priority] ?? "neutral"} bracket {...rest}>
      P-{priority}
    </ProtocolBadge>
  )
}
