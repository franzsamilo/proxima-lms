"use client"

import { Card } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import { TaskTable } from "@/components/tasks/task-table"
import type { TaskRow } from "@/components/tasks/task-table"

interface TasksClientProps {
  submissions: TaskRow[]
  showStudent: boolean
}

const tabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Graded", value: "graded" },
]

export function TasksClient({ submissions, showStudent }: TasksClientProps) {
  function filterSubmissions(activeTab: string) {
    if (activeTab === "pending") return submissions.filter((s) => s.status === "SUBMITTED")
    if (activeTab === "graded") return submissions.filter((s) => s.status === "GRADED")
    return submissions
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5">
        <Tabs tabs={tabs} defaultValue="all">
          {(activeTab) => (
            <TaskTable
              submissions={filterSubmissions(activeTab)}
              showStudent={showStudent}
            />
          )}
        </Tabs>
      </div>
    </Card>
  )
}
