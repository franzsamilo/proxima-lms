"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { gradeSubmission } from "@/actions/grading-actions"

export interface GradingFormProps {
  submissionId: string
}

export function GradingForm({ submissionId }: GradingFormProps) {
  const { toastProps, showToast } = useToast()
  const [isPending, setIsPending] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const result = await gradeSubmission(submissionId, formData)
      if (result?.error) {
        const msg =
          typeof result.error === "string"
            ? result.error
            : "Validation failed. Check the grade and feedback fields."
        showToast(msg, "error")
      } else {
        showToast("Submission graded successfully.", "success")
        form.reset()
      }
    } catch {
      showToast("An unexpected error occurred.", "error")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Toast {...toastProps} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="grade"
            className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
          >
            Grade (0–100)
          </label>
          <Input
            id="grade"
            name="grade"
            type="number"
            min={0}
            max={100}
            placeholder="85"
            required
            className="max-w-[120px]"
          />
        </div>
        <div>
          <label
            htmlFor="feedback"
            className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5"
          >
            Feedback (optional)
          </label>
          <Textarea
            id="feedback"
            name="feedback"
            placeholder="Write your feedback here..."
            rows={4}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit Grade"}
        </Button>
      </form>
    </>
  )
}
