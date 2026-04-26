import * as React from "react"
import { cn } from "@/lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "raised" | "outline"
  bracket?: boolean
  scanline?: boolean
  padding?: "none" | "sm" | "md" | "lg"
  glow?: boolean
}

const variantMap = {
  default: "bg-surface-2 shadow-[var(--shadow-card)]",
  subtle: "bg-surface-1 border border-edge",
  raised: "bg-surface-3 shadow-[var(--shadow-elevated)]",
  outline: "bg-transparent border border-edge",
}

const paddingMap = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      className,
      variant = "default",
      bracket = false,
      scanline = false,
      glow = false,
      padding = "md",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-[var(--radius-md)] transition-colors duration-200",
          variantMap[variant],
          paddingMap[padding],
          bracket && "bracket-frame-4",
          scanline && "bg-scanline",
          glow && "shadow-[0_0_32px_rgba(34,211,183,0.15)]",
          className
        )}
        {...props}
      >
        {bracket && (
          <>
            <span className="bracket tl" />
            <span className="bracket tr" />
            <span className="bracket bl" />
            <span className="bracket br" />
          </>
        )}
        {children}
      </div>
    )
  }
)
Panel.displayName = "Panel"

interface PanelHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode
  title?: React.ReactNode
  action?: React.ReactNode
  divider?: boolean
}

export function PanelHeader({
  eyebrow,
  title,
  action,
  divider = false,
  className,
  children,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        divider && "pb-4 border-b border-edge mb-4",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {eyebrow && (
          <span className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[0.18em] text-ink-ghost">
            {eyebrow}
          </span>
        )}
        {title && (
          <h3 className="font-[family-name:var(--font-family-display)] text-[16px] font-semibold text-ink-primary tracking-tight truncate">
            {title}
          </h3>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
