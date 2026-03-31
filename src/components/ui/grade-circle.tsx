import * as React from "react"
import { cn } from "@/lib/utils"

export interface GradeCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  grade: number
}

function getGradeStyles(grade: number) {
  if (grade >= 90) return { bg: "bg-success-tint", border: "border-success/30", text: "text-success" }
  if (grade >= 80) return { bg: "bg-info-tint", border: "border-info/30", text: "text-info" }
  if (grade >= 70) return { bg: "bg-warning-tint", border: "border-warning/30", text: "text-warning" }
  return { bg: "bg-danger-tint", border: "border-danger/30", text: "text-danger" }
}

const GradeCircle = React.forwardRef<HTMLDivElement, GradeCircleProps>(
  ({ grade, className, ...props }, ref) => {
    const styles = getGradeStyles(grade)

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
