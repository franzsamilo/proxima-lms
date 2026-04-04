"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { TaskTable } from "@/components/tasks/task-table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { TaskRow } from "@/components/tasks/task-table"

interface TasksClientProps {
  submissions: TaskRow[]
  showStudent: boolean
}

const ITEMS_PER_PAGE = 10

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Graded", value: "graded" },
]

export function TasksClient({ submissions, showStudent }: TasksClientProps) {
  const [page, setPage] = useState(1)

  function filterSubmissions(activeTab: string) {
    if (activeTab === "pending") return submissions.filter((s) => s.status === "SUBMITTED")
    if (activeTab === "graded") return submissions.filter((s) => s.status === "GRADED")
    return submissions
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5">
        <Tabs tabs={tabs} defaultValue="all" onChange={() => setPage(1)}>
          {(activeTab) => {
            const filtered = filterSubmissions(activeTab)
            const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
            const currentPage = Math.min(page, totalPages)
            const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

            return (
              <>
                <TaskTable
                  submissions={paginated}
                  showStudent={showStudent}
                />
                {filtered.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between pt-4 border-t border-edge mt-4">
                    <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
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
              </>
            )
          }}
        </Tabs>
      </div>
    </Card>
  )
}
