import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2.5 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost transition-all duration-200 focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
