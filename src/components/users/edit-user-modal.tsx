"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Avatar } from "@/components/ui/avatar"
import { updateUser } from "@/actions/user-actions"
import type { UserRow } from "./user-table"

interface EditUserModalProps {
  open: boolean
  onClose: () => void
  user: UserRow | null
}

export function EditUserModal({ open, onClose, user }: EditUserModalProps) {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [role, setRole] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [schoolLevel, setSchoolLevel] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)
  const { showToast, toastProps } = useToast()

  React.useEffect(() => {
    if (user) {
      setName(user.name)
      setRole(user.role)
      setDepartment(user.department ?? "")
      setSchoolLevel(user.schoolLevel ?? "")
    }
  }, [user])

  async function handleSave() {
    if (!user) return

    setIsPending(true)
    const formData = new FormData()
    formData.set("name", name)
    formData.set("role", role)
    // Always send department — empty string is coerced to null by the action.
    formData.set("department", department)
    // Always send schoolLevel — "" means "— None —" (null); action coerces.
    formData.set("schoolLevel", schoolLevel)

    const result = await updateUser(user.id, formData)

    if (result?.error) {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Failed to save changes."
      showToast(msg, "error")
    } else {
      showToast("User updated successfully.", "success")
      router.refresh()
      onClose()
    }
    setIsPending(false)
  }

  if (!user) return null

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Edit User"
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* User identity display */}
          <div className="flex items-center gap-3 bg-surface-3 border border-edge rounded-[var(--radius-md)] px-4 py-3">
            <Avatar name={user.name} size={40} />
            <div>
              <p className="font-[family-name:var(--font-family-display)] text-[14px] font-bold text-ink-primary">
                {user.name}
              </p>
              <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary">
                {user.email}
              </p>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label
              htmlFor="user-name"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Name
            </label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* Role select */}
          <div>
            <label
              htmlFor="user-role"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Role
            </label>
            <Select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </Select>
          </div>

          {/* Department input */}
          <div>
            <label
              htmlFor="user-department"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              Department
            </label>
            <Input
              id="user-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Robotics, Engineering…"
            />
          </div>

          {/* School Level select */}
          <div>
            <label
              htmlFor="user-school-level"
              className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
            >
              School Level
            </label>
            <Select
              id="user-school-level"
              value={schoolLevel}
              onChange={(e) => setSchoolLevel(e.target.value)}
            >
              <option value="">— None —</option>
              <option value="ELEMENTARY">Elementary</option>
              <option value="HS">High School</option>
              <option value="COLLEGE">College</option>
            </Select>
          </div>
        </div>
      </Modal>

      <Toast {...toastProps} />
    </>
  )
}
