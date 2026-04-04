import * as React from "react"
import {
  DataTable,
  DataTableHeader,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { GradeCircle } from "@/components/ui/grade-circle"

const lessonTypeVariantMap: Record<string, "info" | "success" | "warning" | "purple" | "neutral"> = {
  CODE: "info",
  VIDEO: "purple",
  QUIZ: "warning",
  TASK: "success",
  SLIDES: "neutral",
}

export interface GradeRow {
  id: string
  lessonTitle: string
  courseTitle: string
  lessonType: string
  submittedAt: Date | null
  grade: number
  feedback: string | null
}

export interface GradeTableProps {
  grades: GradeRow[]
}

export function GradeTable({ grades }: GradeTableProps) {
  if (grades.length === 0) {
    return (
      <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
        No graded submissions yet.
      </div>
    )
  }

  const renderMobileCard = (row: GradeRow) => (
    <div className="bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5">
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {row.lessonTitle}
          </p>
          <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary mt-0.5">
            {row.courseTitle}
          </p>
        </div>
        <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px] shrink-0" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
          {row.lessonType}
        </Badge>
        {row.submittedAt && (
          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
            {new Date(row.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
      {row.feedback && (
        <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary mt-2 line-clamp-2">
          {row.feedback}
        </p>
      )}
    </div>
  )

  return (
    <DataTable data={grades} mobileCard={renderMobileCard}>
      <DataTableHeader>
        <tr>
          <DataTableHead>Task</DataTableHead>
          <DataTableHead>Course</DataTableHead>
          <DataTableHead>Type</DataTableHead>
          <DataTableHead>Submitted</DataTableHead>
          <DataTableHead>Grade</DataTableHead>
          <DataTableHead>Feedback</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {grades.map((row) => (
          <DataTableRow key={row.id}>
            <DataTableCell primary>{row.lessonTitle}</DataTableCell>
            <DataTableCell>{row.courseTitle}</DataTableCell>
            <DataTableCell>
              <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
                {row.lessonType}
              </Badge>
            </DataTableCell>
            <DataTableCell>
              {row.submittedAt
                ? new Date(row.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </DataTableCell>
            <DataTableCell>
              <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px]" />
            </DataTableCell>
            <DataTableCell>
              {row.feedback ? (
                <span
                  title={row.feedback}
                  className="block max-w-[200px] truncate text-ink-secondary"
                >
                  {row.feedback}
                </span>
              ) : (
                <span className="text-ink-ghost">—</span>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
