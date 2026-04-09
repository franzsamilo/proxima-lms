import * as React from "react"
import Link from "next/link"
import {
  DataTable,
  DataTableHeader,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { GradeCircle } from "@/components/ui/grade-circle"

const lessonTypeVariantMap: Record<string, "info" | "success" | "warning" | "purple" | "neutral"> = {
  CODE: "info",
  VIDEO: "purple",
  QUIZ: "warning",
  TASK: "success",
  SLIDES: "neutral",
}

export interface TaskRow {
  id: string
  lessonTitle: string
  studentName?: string
  lessonType: string
  courseTitle?: string
  status: string
  submittedAt: Date | null
  grade: number | null
}

export interface TaskTableProps {
  submissions: TaskRow[]
  showStudent?: boolean
  showCourse?: boolean
}

function PendingLabel() {
  return (
    <span className="font-[family-name:var(--font-family-mono)] text-[11px] uppercase tracking-[0.5px] text-ink-ghost">
      Pending
    </span>
  )
}

export function TaskTable({
  submissions,
  showStudent = false,
  showCourse = false,
}: TaskTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
        No submissions found.
      </div>
    )
  }

  const renderMobileCard = (row: TaskRow) => (
    <Link
      href={`/tasks/${row.id}`}
      className="block bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5 hover:border-edge-strong transition-colors"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {row.lessonTitle}
          </p>
          {showCourse && row.courseTitle && (
            <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary mt-0.5 truncate">
              {row.courseTitle}
            </p>
          )}
          {showStudent && row.studentName && (
            <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary mt-0.5">
              {row.studentName}
            </p>
          )}
        </div>
        {row.grade !== null ? (
          <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px] shrink-0" />
        ) : (
          <PendingLabel />
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
          {row.lessonType}
        </Badge>
        <StatusBadge status={row.status} />
        {row.submittedAt && (
          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary ml-auto">
            {new Date(row.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  )

  return (
    <DataTable data={submissions} mobileCard={renderMobileCard}>
      <DataTableHeader>
        <tr>
          <DataTableHead>Task</DataTableHead>
          {showStudent && <DataTableHead>Student</DataTableHead>}
          {showCourse && <DataTableHead>Course</DataTableHead>}
          <DataTableHead>Type</DataTableHead>
          <DataTableHead>Status</DataTableHead>
          <DataTableHead>Submitted</DataTableHead>
          <DataTableHead>Grade</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {submissions.map((row) => (
          <DataTableRow key={row.id}>
            <DataTableCell primary>
              <Link
                href={`/tasks/${row.id}`}
                className="hover:text-signal transition-colors duration-150"
              >
                {row.lessonTitle}
              </Link>
            </DataTableCell>
            {showStudent && (
              <DataTableCell>{row.studentName ?? "—"}</DataTableCell>
            )}
            {showCourse && (
              <DataTableCell>{row.courseTitle ?? "—"}</DataTableCell>
            )}
            <DataTableCell>
              <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
                {row.lessonType}
              </Badge>
            </DataTableCell>
            <DataTableCell>
              <StatusBadge status={row.status} />
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
              {row.grade !== null ? (
                <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px]" />
              ) : (
                <PendingLabel />
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
