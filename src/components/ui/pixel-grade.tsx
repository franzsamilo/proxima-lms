import * as React from "react"
import { cn } from "@/lib/utils"
import { gradeTier } from "@/lib/utils"

interface PixelGradeProps {
  grade: number | null | undefined
  size?: "sm" | "md" | "lg"
  className?: string
}

const tierTone = {
  a: { bg: "bg-success-tint", text: "text-success", border: "border-success/40", letter: "A" },
  b: { bg: "bg-info-tint", text: "text-info", border: "border-info/40", letter: "B" },
  c: { bg: "bg-warning-tint", text: "text-warning", border: "border-warning/40", letter: "C" },
  f: { bg: "bg-danger-tint", text: "text-danger", border: "border-danger/40", letter: "F" },
}

const sizeMap = {
  sm: { box: "w-10 h-10", num: "text-[12px]", letter: "text-[8px]" },
  md: { box: "w-14 h-14", num: "text-[16px]", letter: "text-[9px]" },
  lg: { box: "w-20 h-20", num: "text-[22px]", letter: "text-[10px]" },
}

export function PixelGrade({ grade, size = "md", className }: PixelGradeProps) {
  if (grade == null) {
    const s = sizeMap[size]
    return (
      <div
        className={cn(
          "relative inline-flex flex-col items-center justify-center border border-dashed border-edge text-ink-ghost rounded-[4px]",
          s.box,
          className
        )}
      >
        <span className={cn("font-[family-name:var(--font-family-mono)] tabular", s.num)}>—</span>
        <span className={cn("font-[family-name:var(--font-family-mono)] tracking-[0.2em] mt-0.5", s.letter)}>
          UNGRD
        </span>
      </div>
    )
  }

  const t = tierTone[gradeTier(grade)]
  const s = sizeMap[size]

  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center justify-center border rounded-[4px] bracket-frame-4",
        t.bg,
        t.text,
        t.border,
        s.box,
        className
      )}
    >
      <span className="bracket tl" />
      <span className="bracket tr" />
      <span className="bracket bl" />
      <span className="bracket br" />
      <span className={cn("font-[family-name:var(--font-family-mono)] font-bold tabular leading-none", s.num)}>
        {grade}
      </span>
      <span className={cn("font-[family-name:var(--font-family-mono)] tracking-[0.2em] opacity-70 mt-0.5", s.letter)}>
        TIER {t.letter}
      </span>
    </div>
  )
}
