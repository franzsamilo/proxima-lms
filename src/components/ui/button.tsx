import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  primary:
    "bg-signal text-surface-0 hover:bg-signal-hover hover:shadow-[var(--shadow-glow)] border-transparent",
  secondary:
    "bg-surface-3 text-ink-primary border border-edge hover:border-edge-strong",
  ghost:
    "bg-transparent text-ink-secondary border-transparent hover:bg-surface-3 hover:text-ink-primary",
  danger:
    "bg-danger text-white border-transparent hover:brightness-110 hover:shadow-[0_0_16px_rgba(248,113,113,0.25)]",
} as const

const buttonSizes = {
  default: "px-4 py-2 text-[13px]",
  sm: "px-3 py-1.5 text-[12px]",
  icon: "p-2",
} as const

type ButtonVariant = keyof typeof buttonVariants
type ButtonSize = keyof typeof buttonSizes

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-[family-name:var(--font-family-body)] font-semibold rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, buttonSizes }
