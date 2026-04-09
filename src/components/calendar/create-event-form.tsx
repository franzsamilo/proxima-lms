"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createEvent } from "@/actions/calendar-actions"

interface Course {
  id: string
  title: string
}

interface CreateEventFormProps {
  open: boolean
  onClose: () => void
  courses: Course[]
}

export function CreateEventForm({ open, onClose, courses }: CreateEventFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Server-free local "today" (YYYY-MM-DD) for the date input min attribute.
  // The real past-date guard lives in the Zod schema on the server.
  const today = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!formRef.current) return

    setPending(true)
    setError(null)

    const formData = new FormData(formRef.current)
    const result = await createEvent(formData)

    setPending(false)

    if ("error" in result && result.error) {
      const rawErr: unknown = result.error
      const errs =
        typeof rawErr === "string"
          ? { _: [rawErr] }
          : (rawErr as Record<string, string[] | undefined>)
      const first = Object.values(errs).flat()[0]
      setError(first ?? "Failed to create event.")
      return
    }

    formRef.current.reset()
    router.refresh()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Event"
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-event-form"
            disabled={pending}
          >
            {pending ? "Creating…" : "Create Event"}
          </Button>
        </>
      }
    >
      <form
        id="create-event-form"
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <p className="font-[family-name:var(--font-family-body)] text-[13px] text-danger bg-danger/10 border border-danger/20 rounded-[var(--radius-md)] px-3 py-2">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-ink-secondary">
            Title
          </label>
          <Input
            name="title"
            placeholder="Event title"
            required
            minLength={2}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-ink-secondary">
            Date
          </label>
          <Input
            name="date"
            type="date"
            required
            min={today}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-ink-secondary">
            Type
          </label>
          <Select name="type" required>
            <option value="">Select type…</option>
            <option value="deadline">Deadline</option>
            <option value="exam">Exam</option>
            <option value="event">Event</option>
          </Select>
        </div>

        {courses.length > 0 && (
          <div className="space-y-1.5">
            <label className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-ink-secondary">
              Course (optional)
            </label>
            <Select name="courseId">
              <option value="">No course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </div>
        )}
      </form>
    </Modal>
  )
}
