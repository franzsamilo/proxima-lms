import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  thick?: boolean
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, thick = false, className, ...props }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        className={cn(
          "w-full bg-surface-3 rounded-full overflow-hidden",
          thick ? "h-2" : "h-1.5",
          className
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div
          className="h-full rounded-full transition-all duration-600 ease-out"
          style={{
            width: `${clampedValue}%`,
            background: "linear-gradient(90deg, var(--color-signal), #0EA5A0)",
          }}
        />
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
