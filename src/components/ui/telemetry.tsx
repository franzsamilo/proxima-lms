import * as React from "react"
import { cn } from "@/lib/utils"

interface TelemetryProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md"
  tracking?: "normal" | "wide" | "wider"
  as?: "span" | "div" | "p"
}

const sizeMap = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-[11px]",
}

const trackingMap = {
  normal: "tracking-[0.1em]",
  wide: "tracking-[0.18em]",
  wider: "tracking-[0.28em]",
}

export const Telemetry = React.forwardRef<HTMLSpanElement, TelemetryProps>(
  ({ className, size = "sm", tracking = "wide", as = "span", children, ...props }, ref) => {
    const Comp = as as keyof React.JSX.IntrinsicElements
    return React.createElement(
      Comp,
      {
        ref,
        className: cn(
          "font-[family-name:var(--font-family-mono)] font-medium uppercase tabular",
          sizeMap[size],
          trackingMap[tracking],
          className
        ),
        ...props,
      },
      children
    )
  }
)
Telemetry.displayName = "Telemetry"
