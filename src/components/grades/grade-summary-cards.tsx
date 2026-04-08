import * as React from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { GradeCircle } from "@/components/ui/grade-circle"
import { ProgressBar } from "@/components/ui/progress-bar"

export interface CourseSummary {
  courseId: string
  courseTitle: string
  averageGrade: number | null
  completedTasks: number
  totalTasks: number
}

export interface GradeSummaryCardsProps {
  summaries: CourseSummary[]
}

export function GradeSummaryCards({ summaries }: GradeSummaryCardsProps) {
  if (summaries.length === 0) {
    return (
      <p className="text-[13px] text-ink-ghost">
        No enrolled courses found.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {summaries.map((summary) => {
        const progress =
          summary.totalTasks > 0
            ? Math.round((summary.completedTasks / summary.totalTasks) * 100)
            : 0

        return (
          <Card key={summary.courseId} className="space-y-4">
            <CardHeader className="mb-0">{summary.courseTitle}</CardHeader>

            <div className="flex items-center gap-4">
              {summary.averageGrade !== null ? (
                <GradeCircle grade={summary.averageGrade} />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-edge flex items-center justify-center font-[family-name:var(--font-family-mono)] text-[13px] text-ink-ghost">
                  —
                </div>
              )}
              <div className="flex-1 space-y-0.5">
                <p className="font-[family-name:var(--font-family-mono)] text-[20px] font-bold text-ink-primary">
                  {summary.averageGrade !== null ? `${summary.averageGrade}` : "—"}
                </p>
                <p className="text-[11px] text-ink-ghost font-[family-name:var(--font-family-mono)] uppercase tracking-[1px]">
                  avg grade
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[1px] text-ink-ghost">
                  Progress
                </span>
                <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-secondary">
                  {summary.completedTasks}/{summary.totalTasks} tasks
                </span>
              </div>
              <ProgressBar value={progress} thick />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
