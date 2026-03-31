"use client"

import * as React from "react"

export interface GradeDistribution {
  a: number  // 90-100
  b: number  // 80-89
  c: number  // 70-79
  f: number  // <70
}

export interface GradeDistributionChartProps {
  distribution: GradeDistribution
}

export function GradeDistributionChart({ distribution }: GradeDistributionChartProps) {
  const total = distribution.a + distribution.b + distribution.c + distribution.f

  const bars = [
    { label: "A (90–100)", count: distribution.a, colorClass: "bg-success", textClass: "text-success" },
    { label: "B (80–89)", count: distribution.b, colorClass: "bg-info", textClass: "text-info" },
    { label: "C (70–79)", count: distribution.c, colorClass: "bg-warning", textClass: "text-warning" },
    { label: "F (<70)", count: distribution.f, colorClass: "bg-danger", textClass: "text-danger" },
  ]

  if (total === 0) {
    return (
      <p className="text-[13px] text-ink-ghost">No graded submissions to display.</p>
    )
  }

  return (
    <div className="space-y-3">
      {bars.map((bar) => {
        const pct = total > 0 ? Math.round((bar.count / total) * 100) : 0
        return (
          <div key={bar.label} className="flex items-center gap-3">
            <span
              className="font-[family-name:var(--font-family-mono)] text-[11px] font-medium shrink-0 w-24 text-ink-secondary"
            >
              {bar.label}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-6 bg-surface-3 rounded-[var(--radius-sm)] overflow-hidden">
                <div
                  className={`h-full rounded-[var(--radius-sm)] transition-all duration-600 ease-out ${bar.colorClass}`}
                  style={{ width: pct > 0 ? `${pct}%` : "0%" }}
                />
              </div>
              <span className={`font-[family-name:var(--font-family-mono)] text-[12px] font-bold w-10 text-right ${bar.textClass}`}>
                {bar.count}
              </span>
            </div>
          </div>
        )
      })}
      <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost uppercase tracking-[1px] pt-1">
        Total graded: {total}
      </p>
    </div>
  )
}
