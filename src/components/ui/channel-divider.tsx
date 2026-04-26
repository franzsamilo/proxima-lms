import * as React from "react"
import { cn } from "@/lib/utils"

interface ChannelDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  align?: "left" | "center" | "right"
}

export function ChannelDivider({
  label,
  align = "left",
  className,
  ...props
}: ChannelDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      {(align === "center" || align === "right") && <Bar />}
      {label && (
        <span className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[0.22em] text-ink-ghost shrink-0">
          {label}
        </span>
      )}
      {(align === "center" || align === "left") && <Bar />}
    </div>
  )
}

function Bar() {
  return (
    <div className="flex-1 flex items-center gap-1">
      <span className="w-1 h-1 bg-signal rounded-full shrink-0" />
      <span className="h-px flex-1 bg-edge" />
      <span className="w-1 h-1 bg-edge rounded-full shrink-0" />
    </div>
  )
}

interface TickRowProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
}

export function TickRow({ count = 12, className, ...props }: TickRowProps) {
  return (
    <div
      className={cn("flex items-end gap-[3px] h-3", className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-px bg-edge",
            i % 4 === 0 ? "h-3" : i % 2 === 0 ? "h-2" : "h-1.5"
          )}
        />
      ))}
    </div>
  )
}
