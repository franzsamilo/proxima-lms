"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { AssignKitModal } from "./assign-kit-modal"

interface Student {
  id: string
  name: string
  email: string
}

interface AssignKitTriggerProps {
  kit: { id: string; name: string }
  students: Student[]
}

export function AssignKitTrigger({ kit, students }: AssignKitTriggerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <UserPlus size={14} />
        Assign
      </Button>

      <AssignKitModal
        open={open}
        onClose={() => setOpen(false)}
        kit={kit}
        students={students}
      />
    </>
  )
}
