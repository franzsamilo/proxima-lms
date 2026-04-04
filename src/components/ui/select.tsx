import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-11 md:h-10 w-full bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2.5 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary cursor-pointer transition-all duration-200 focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none",
          className
        )}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }
