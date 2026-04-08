import * as React from "react"
import { cn, gradeTier, type GradeTier } from "@/lib/utils"

export interface GradeCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  grade: number
}

const tierStyles: Record<GradeTier, { bg: string; border: string; text: string }> = {
  a: { bg: "bg-success-tint", border: "border-success/30", text: "text-success" },
  b: { bg: "bg-info-tint", border: "border-info/30", text: "text-info" },
  c: { bg: "bg-warning-tint", border: "border-warning/30", text: "text-warning" },
  f: { bg: "bg-danger-tint", border: "border-danger/30", text: "text-danger" },
}

const GradeCircle = React.forwardRef<HTMLDivElement, GradeCircleProps>(
  ({ grade, className, ...props }, ref) => {
    const styles = tierStyles[gradeTier(grade)]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full border-2 font-[family-name:var(--font-family-mono)] text-[16px] font-bold",
          styles.bg,
          styles.border,
          styles.text,
          className
        )}
        {...props}
      >
        {Math.round(grade)}
      </div>
    )
  }
)
GradeCircle.displayName = "GradeCircle"

export { GradeCircle }
