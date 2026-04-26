"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface BaseFieldProps {
  id: string
  label: string
  error?: string
  prefix?: string
}

interface TerminalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id">,
    BaseFieldProps {}

export const TerminalInput = React.forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ id, label, error, prefix, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[0.18em] uppercase text-ink-ghost"
        >
          <span>
            <span className="text-signal/70 mr-1">›</span>
            {label}
          </span>
          {error && <span className="text-danger normal-case tracking-normal">{error}</span>}
        </label>
        <div
          className={cn(
            "relative flex items-center h-10 bg-surface-1/80 border rounded-[4px] transition-all duration-150",
            error
              ? "border-danger/60"
              : "border-edge focus-within:border-signal focus-within:shadow-[0_0_0_3px_var(--color-signal-glow)]"
          )}
        >
          {prefix && (
            <span className="pl-3 font-[family-name:var(--font-family-mono)] text-[12px] text-ink-ghost select-none">
              {prefix}
            </span>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "flex-1 h-full bg-transparent px-3 font-[family-name:var(--font-family-mono)] text-[13px] text-ink-primary placeholder:text-ink-ghost outline-none",
              className
            )}
            {...props}
          />
          {/* corner accents */}
          <span className="pointer-events-none absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-signal/40" />
          <span className="pointer-events-none absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-signal/40" />
        </div>
      </div>
    )
  }
)
TerminalInput.displayName = "TerminalInput"

interface TerminalPasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type">,
    BaseFieldProps {}

export const TerminalPasswordInput = React.forwardRef<HTMLInputElement, TerminalPasswordInputProps>(
  ({ id, label, error, className, ...props }, ref) => {
    const [show, setShow] = React.useState(false)
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[0.18em] uppercase text-ink-ghost"
        >
          <span>
            <span className="text-signal/70 mr-1">›</span>
            {label}
          </span>
          {error && <span className="text-danger normal-case tracking-normal">{error}</span>}
        </label>
        <div
          className={cn(
            "relative flex items-center h-10 bg-surface-1/80 border rounded-[4px] transition-all duration-150",
            error
              ? "border-danger/60"
              : "border-edge focus-within:border-signal focus-within:shadow-[0_0_0_3px_var(--color-signal-glow)]"
          )}
        >
          <input
            id={id}
            ref={ref}
            type={show ? "text" : "password"}
            placeholder="••••••••"
            className={cn(
              "flex-1 h-full bg-transparent px-3 font-[family-name:var(--font-family-mono)] text-[13px] tracking-wider text-ink-primary placeholder:text-ink-ghost outline-none",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="px-3 text-ink-ghost hover:text-signal transition-colors"
            tabIndex={-1}
            aria-label={show ? "Hide passcode" : "Show passcode"}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <span className="pointer-events-none absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-signal/40" />
          <span className="pointer-events-none absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-signal/40" />
        </div>
      </div>
    )
  }
)
TerminalPasswordInput.displayName = "TerminalPasswordInput"

interface TerminalSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id">,
    BaseFieldProps {}

export const TerminalSelect = React.forwardRef<HTMLSelectElement, TerminalSelectProps>(
  ({ id, label, error, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[0.18em] uppercase text-ink-ghost"
        >
          <span>
            <span className="text-signal/70 mr-1">›</span>
            {label}
          </span>
          {error && <span className="text-danger normal-case tracking-normal">{error}</span>}
        </label>
        <div
          className={cn(
            "relative flex items-center h-10 bg-surface-1/80 border rounded-[4px] transition-all duration-150 px-3",
            error
              ? "border-danger/60"
              : "border-edge focus-within:border-signal focus-within:shadow-[0_0_0_3px_var(--color-signal-glow)]"
          )}
        >
          <select
            id={id}
            ref={ref}
            className={cn(
              "flex-1 bg-transparent font-[family-name:var(--font-family-mono)] text-[13px] text-ink-primary outline-none appearance-none cursor-pointer pr-6",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <span className="pointer-events-none absolute right-3 text-signal/70 text-[12px]">▾</span>
          <span className="pointer-events-none absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-signal/40" />
          <span className="pointer-events-none absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-signal/40" />
        </div>
      </div>
    )
  }
)
TerminalSelect.displayName = "TerminalSelect"
