"use client"

import { useState } from "react"
import { submitTask } from "@/actions/task-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Send, CheckCircle } from "lucide-react"

interface TaskSubmissionProps {
  brief: string
  requirements: string[]
  rubric: Record<string, string>
  lessonId: string
  existingSubmission?: {
    codeContent?: string | null
    videoUrl?: string | null
    status?: string
  }
}

export function TaskSubmission({
  brief,
  requirements,
  rubric,
  lessonId,
  existingSubmission,
}: TaskSubmissionProps) {
  const [codeContent, setCodeContent] = useState(
    existingSubmission?.codeContent ?? ""
  )
  const [videoUrl, setVideoUrl] = useState(
    existingSubmission?.videoUrl ?? ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
  } | null>(null)

  const alreadySubmitted =
    existingSubmission?.status === "SUBMITTED" ||
    existingSubmission?.status === "GRADED"

  async function handleSubmit() {
    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData()
    formData.set("lessonId", lessonId)
    if (codeContent) formData.set("codeContent", codeContent)
    if (videoUrl) formData.set("videoUrl", videoUrl)

    const res = await submitTask(formData)

    if (res && "error" in res) {
      const resErr = (res as { error: unknown }).error
      setResult({
        error: typeof resErr === "string" ? resErr : "Submission failed",
      })
    } else {
      setResult({ success: true })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Brief */}
      <div>
        <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary mb-2">
          Task Brief
        </h3>
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-secondary leading-relaxed">
          {brief}
        </p>
      </div>

      {/* Requirements */}
      {requirements.length > 0 && (
        <div>
          <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary mb-2">
            Requirements
          </h3>
          <ul className="space-y-1.5">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle
                  size={14}
                  className="text-ink-tertiary mt-0.5 shrink-0"
                />
                <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rubric */}
      {Object.keys(rubric).length > 0 && (
        <div>
          <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary mb-2">
            Rubric
          </h3>
          <div className="rounded-[var(--radius-md)] border border-edge overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-3">
                  <th className="text-left px-3 py-2 font-medium text-ink-secondary">
                    Criteria
                  </th>
                  <th className="text-left px-3 py-2 font-medium text-ink-secondary">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(rubric).map(([criteria, points]) => (
                  <tr key={criteria} className="border-t border-edge">
                    <td className="px-3 py-2 text-ink-primary">{criteria}</td>
                    <td className="px-3 py-2 text-ink-tertiary font-[family-name:var(--font-family-mono)]">
                      {points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission form */}
      <div>
        <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary mb-2">
          Your Submission
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
              Code / Response
            </label>
            <Textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="Paste your code or write your response here..."
              rows={10}
              className="font-[family-name:var(--font-family-mono)] text-[13px]"
            />
          </div>

          <div>
            <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
              Video URL{" "}
              <span className="text-ink-tertiary font-normal">(optional)</span>
            </label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Send size={14} className="mr-1.5" />
          {isSubmitting
            ? "Submitting..."
            : alreadySubmitted
              ? "Resubmit"
              : "Submit Task"}
        </Button>

        {alreadySubmitted && !result && (
          <span className="text-[12px] text-ink-tertiary">
            Previously submitted
          </span>
        )}

        {result?.success && (
          <span className="text-[13px] text-success">
            Submitted successfully!
          </span>
        )}
        {result?.error && (
          <span className="text-[13px] text-danger">{result.error}</span>
        )}
      </div>
    </div>
  )
}
