import * as React from "react"
import { cn } from "@/lib/utils"

interface OrbitalProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  label?: string
  showValue?: boolean
}

const heightMap = { sm: "h-1", md: "h-1.5", lg: "h-2" }

export function OrbitalProgress({
  value,
  max = 100,
  size = "md",
  label,
  showValue = false,
  className,
  ...props
}: OrbitalProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[10px] font-[family-name:var(--font-family-mono)] tracking-[0.16em] uppercase">
          {label && <span className="text-ink-ghost">{label}</span>}
          {showValue && (
            <span className="text-signal tabular">
              {String(Math.round(value)).padStart(3, "0")}
              <span className="text-ink-ghost">/{String(max).padStart(3, "0")}</span>
            </span>
          )}
        </div>
      )}
      <div className={cn("relative w-full bg-surface-3 overflow-hidden rounded-full", heightMap[size])}>
        {/* tick marks underneath */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-edge last:border-r-0" />
          ))}
        </div>
        {/* fill */}
        <div
          className="relative h-full bg-gradient-to-r from-signal-deep via-signal to-signal-hover transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        >
          <div
            className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)]"
            style={{ animation: "shimmer 2.5s linear infinite", backgroundSize: "200% 100%" }}
          />
        </div>
      </div>
    </div>
  )
}

interface SignalBarsProps {
  value: number
  max?: number
  bars?: number
  className?: string
}

export function SignalBars({ value, max = 100, bars = 5, className }: SignalBarsProps) {
  const ratio = Math.max(0, Math.min(1, value / max))
  const filled = Math.round(ratio * bars)
  return (
    <div className={cn("inline-flex items-end gap-[2px] h-3", className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const heightPct = ((i + 1) / bars) * 100
        const on = i < filled
        return (
          <span
            key={i}
            className={cn(
              "w-[3px] transition-all duration-300 rounded-[1px]",
              on ? "bg-signal" : "bg-edge"
            )}
            style={{ height: `${heightPct}%` }}
          />
        )
      })}
    </div>
  )
}

interface OrbitalRingProps {
  value: number
  max?: number
  size?: number
  stroke?: number
  className?: string
  label?: React.ReactNode
}

export function OrbitalRing({ value, max = 100, size = 56, stroke = 3, className, label }: OrbitalRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, value / max))
  const dash = circumference * pct
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--color-edge)" strokeWidth={stroke} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--color-signal)" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-family-mono)] text-[11px] font-bold text-ink-primary tabular">
          {label}
        </span>
      )}
    </div>
  )
}
