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
  status: string
  submittedAt: Date | null
  grade: number | null
}

export interface TaskTableProps {
  submissions: TaskRow[]
  showStudent?: boolean
}

export function TaskTable({ submissions, showStudent = false }: TaskTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
        No submissions found.
      </div>
    )
  }

  return (
    <DataTable>
      <DataTableHeader>
        <tr>
          <DataTableHead>Task</DataTableHead>
          {showStudent && <DataTableHead>Student</DataTableHead>}
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
                <span className="text-ink-ghost">—</span>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
