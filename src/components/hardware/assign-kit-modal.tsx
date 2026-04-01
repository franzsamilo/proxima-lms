"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { assignKit } from "@/actions/hardware-actions"

interface Student {
  id: string
  name: string
  email: string
}

interface AssignKitModalProps {
  open: boolean
  onClose: () => void
  kit: {
    id: string
    name: string
  }
  students: Student[]
}

export function AssignKitModal({ open, onClose, kit, students }: AssignKitModalProps) {
  const [selectedStudentId, setSelectedStudentId] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)
  const { toast, showToast, hideToast, toastProps } = useToast()

  React.useEffect(() => {
    if (!open) {
      setSelectedStudentId("")
    }
  }, [open])

  async function handleAssign() {
    if (!selectedStudentId) {
      showToast("Please select a student.", "error")
      return
    }

    setIsPending(true)
    const formData = new FormData()
    formData.set("kitId", kit.id)
    formData.set("userId", selectedStudentId)

    const result = await assignKit(formData)

    if (result?.error) {
      showToast(typeof result.error === "string" ? result.error : "Failed to assign kit.", "error")
    } else {
      showToast(`Kit assigned successfully.`, "success")
      setSelectedStudentId("")
      onClose()
    }
    setIsPending(false)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Assign Kit — ${kit.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isPending || !selectedStudentId}>
              {isPending ? "Assigning…" : "Assign Kit"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Kit name */}
          <div className="bg-surface-3 border border-edge rounded-[var(--radius-md)] px-4 py-3">
            <p className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[1.5px] text-ink-ghost mb-1">
              Kit
            </p>
            <p className="font-[family-name:var(--font-family-display)] text-[14px] font-bold text-ink-primary">
              {kit.name}
            </p>
          </div>

          {/* Student select */}
          <div>
            <label
              htmlFor="student-select"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Assign To
            </label>
            <Select
              id="student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.email}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      <Toast {...toastProps} />
    </>
  )
}
