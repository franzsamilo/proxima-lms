"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)

    return (
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          ref={ref}
          className={cn(
            "flex h-11 md:h-10 w-full bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2.5 pr-10 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost transition-all duration-200 focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-ghost hover:text-ink-secondary transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
