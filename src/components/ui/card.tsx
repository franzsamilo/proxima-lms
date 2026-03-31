import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-2 shadow-[var(--shadow-card)] rounded-[var(--radius-lg)] p-5 transition-all duration-200 hover:border-edge-strong",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "font-[family-name:var(--font-family-display)] text-[13px] font-bold uppercase tracking-[2px] text-ink-tertiary mb-4",
          className
        )}
        {...props}
      />
    )
  }
)
CardHeader.displayName = "CardHeader"

export { Card, CardHeader }
