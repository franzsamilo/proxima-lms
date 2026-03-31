import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  success: "bg-success-tint text-success",
  info: "bg-info-tint text-info",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  purple: "bg-purple-tint text-purple",
  neutral: "bg-[rgba(94,106,130,0.12)] text-ink-tertiary",
} as const

type BadgeVariant = keyof typeof badgeVariants

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-[family-name:var(--font-family-mono)] text-[11px] font-medium tracking-[0.5px] rounded-full px-2.5 py-0.5",
          badgeVariants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

/* ── Level Badge ── */

const levelVariantMap: Record<string, BadgeVariant> = {
  ELEMENTARY: "success",
  HS: "info",
  COLLEGE: "purple",
}

const levelLabelMap: Record<string, string> = {
  ELEMENTARY: "Elementary",
  HS: "High School",
  COLLEGE: "College",
}

interface LevelBadgeProps extends Omit<BadgeProps, "variant"> {
  level: string
}

function LevelBadge({ level, children, ...props }: LevelBadgeProps) {
  const variant = levelVariantMap[level] ?? "neutral"
  return (
    <Badge variant={variant} {...props}>
      {children ?? levelLabelMap[level] ?? level}
    </Badge>
  )
}

/* ── Status Badge ── */

const statusVariantMap: Record<string, BadgeVariant> = {
  // Submission statuses
  GRADED: "success",
  SUBMITTED: "warning",
  PENDING: "warning",
  LATE: "danger",
  MISSING: "danger",
  // Module statuses
  PUBLISHED: "success",
  DRAFT: "neutral",
  LOCKED: "neutral",
  // General
  COMPLETED: "success",
  IN_PROGRESS: "info",
  NOT_STARTED: "neutral",
  ACTIVE: "success",
  INACTIVE: "neutral",
  IN_STOCK: "success",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "danger",
}

const statusLabelMap: Record<string, string> = {
  GRADED: "Graded",
  SUBMITTED: "Submitted",
  PENDING: "Pending",
  LATE: "Late",
  MISSING: "Missing",
  PUBLISHED: "Published",
  DRAFT: "Draft",
  LOCKED: "Locked",
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  NOT_STARTED: "Not Started",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
}

interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string
}

function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? "neutral"
  return (
    <Badge variant={variant} {...props}>
      {children ?? statusLabelMap[status] ?? status}
    </Badge>
  )
}

export { Badge, LevelBadge, StatusBadge, badgeVariants }
export type { BadgeVariant, LevelBadgeProps, StatusBadgeProps }
