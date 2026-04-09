"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { TaskTable } from "@/components/tasks/task-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskRow } from "@/components/tasks/task-table"

type Tab = "all" | "pending" | "graded"

interface TasksClientProps {
  submissions: TaskRow[]
  showStudent: boolean
  showCourse?: boolean
  activeTab: Tab
}

const ITEMS_PER_PAGE = 10

const tabs: { label: string; value: Tab }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Graded", value: "graded" },
]

export function TasksClient({
  submissions,
  showStudent,
  showCourse = false,
  activeTab,
}: TasksClientProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(submissions.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated = submissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5">
        {/* Server-driven tab bar — each tab is a real URL */}
        <div className="flex gap-1 mb-4">
          {tabs.map((tab) => {
            const href = tab.value === "all" ? "/tasks" : `/tasks?tab=${tab.value}`
            const isActive = activeTab === tab.value
            return (
              <Link
                key={tab.value}
                href={href}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium rounded-[var(--radius-md)] transition-all duration-200 font-[family-name:var(--font-family-body)]",
                  isActive
                    ? "bg-signal-muted text-signal"
                    : "text-ink-secondary hover:bg-surface-3 hover:text-ink-primary"
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <TaskTable
          submissions={paginated}
          showStudent={showStudent}
          showCourse={showCourse}
        />
        {submissions.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-4 border-t border-edge mt-4">
            <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, submissions.length)} of{" "}
              {submissions.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={14} className="mr-1" /> Prev
              </Button>
              <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-secondary px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
