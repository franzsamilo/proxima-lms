import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "ghost" | "outline" | "danger" | "subtle"
type Size = "sm" | "md" | "lg"

interface ProtocolButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantMap: Record<Variant, string> = {
  primary:
    "bg-signal text-surface-0 hover:bg-signal-hover hover:shadow-[0_0_24px_var(--color-signal-glow)]",
  outline:
    "bg-transparent text-signal border border-signal/40 hover:border-signal hover:bg-signal-muted hover:shadow-[0_0_18px_var(--color-signal-glow)]",
  ghost:
    "bg-transparent text-ink-secondary hover:bg-surface-3 hover:text-ink-primary",
  subtle:
    "bg-surface-3 text-ink-primary border border-edge hover:border-edge-strong hover:bg-surface-4",
  danger:
    "bg-danger/15 text-danger border border-danger/30 hover:border-danger hover:bg-danger/25",
}

const sizeMap: Record<Size, string> = {
  sm: "h-8 px-3 text-[10px] tracking-[0.16em]",
  md: "h-10 px-4 text-[11px] tracking-[0.22em]",
  lg: "h-12 px-6 text-[12px] tracking-[0.24em]",
}

export const ProtocolButton = React.forwardRef<HTMLButtonElement, ProtocolButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[6px] font-[family-name:var(--font-family-mono)] font-semibold uppercase whitespace-nowrap transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          sizeMap[size],
          variantMap[variant],
          className
        )}
        {...props}
      >
        {/* Subtle inner highlight */}
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%]"
          style={{ transitionProperty: "transform, opacity", transitionDuration: "700ms" }}
        />
        <span className="relative inline-flex items-center gap-2">
          {loading && (
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="14 28" strokeLinecap="round" />
            </svg>
          )}
          {children}
        </span>
      </button>
    )
  }
)
ProtocolButton.displayName = "ProtocolButton"
