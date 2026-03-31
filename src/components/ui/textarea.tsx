import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full min-h-[80px] resize-y bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2.5 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost transition-all duration-200 focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
