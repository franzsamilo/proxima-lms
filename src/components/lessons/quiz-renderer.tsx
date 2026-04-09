"use client"

import { useState } from "react"
import { submitTask } from "@/actions/task-actions"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Send } from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

interface QuizRendererProps {
  questions: QuizQuestion[]
  lessonId: string
  existingAnswers?: Record<string, string>
}

export function QuizRenderer({
  questions,
  lessonId,
  existingAnswers,
}: QuizRendererProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    existingAnswers ?? {}
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(!!existingAnswers)
  const [error, setError] = useState<string | null>(null)

  function handleSelect(questionId: string, optionIndex: number) {
    if (isSubmitted) return
    setAnswers((prev) => ({
      ...prev,
      [questionId]: String(optionIndex),
    }))
  }

  async function handleSubmit() {
    // Hard validate: every question must have an answer
    const missing = questions.filter(
      (q) => !(q.id in answers) || answers[q.id] === undefined || answers[q.id] === ""
    )
    if (missing.length > 0) {
      setError(
        `Please answer all ${questions.length} questions before submitting (${missing.length} remaining).`
      )
      return
    }

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set("lessonId", lessonId)
    formData.set("quizAnswers", JSON.stringify(answers))

    const res = await submitTask(formData)

    if (res && "error" in res) {
      const resErr = (res as { error: unknown }).error
      setError(typeof resErr === "string" ? resErr : "Submission failed")
    } else {
      setIsSubmitted(true)
    }

    setIsSubmitting(false)
  }

  if (questions.length === 0) {
    return (
      <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
        No quiz questions available yet.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qIdx) => {
        const selectedIndex = answers[q.id]
        const isCorrect =
          isSubmitted && selectedIndex === String(q.correctIndex)
        const isWrong =
          isSubmitted &&
          selectedIndex !== undefined &&
          selectedIndex !== String(q.correctIndex)

        return (
          <div
            key={q.id}
            className="rounded-[var(--radius-lg)] border border-edge bg-surface-2 p-5"
          >
            <h3 className="font-[family-name:var(--font-family-body)] text-[14px] font-medium text-ink-primary mb-3">
              <span className="font-[family-name:var(--font-family-mono)] text-ink-tertiary mr-2">
                {qIdx + 1}.
              </span>
              {q.question}
            </h3>

            <div className="space-y-2">
              {q.options.map((option, optIdx) => {
                const isSelected = selectedIndex === String(optIdx)
                const optionIsCorrect =
                  isSubmitted && optIdx === q.correctIndex

                let borderColor = "border-edge"
                if (isSubmitted && optionIsCorrect)
                  borderColor = "border-success"
                else if (isSubmitted && isSelected && !optionIsCorrect)
                  borderColor = "border-danger"
                else if (isSelected) borderColor = "border-signal"

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(q.id, optIdx)}
                    disabled={isSubmitted}
                    className={`w-full flex items-center gap-3 rounded-[var(--radius-md)] border ${borderColor} px-4 py-2.5 text-left transition-all duration-200 cursor-pointer disabled:cursor-default hover:border-edge-strong`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-signal bg-signal"
                          : "border-edge"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-surface-0" />
                      )}
                    </span>

                    <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary flex-1">
                      {option}
                    </span>

                    {isSubmitted && optionIsCorrect && (
                      <CheckCircle size={16} className="text-success shrink-0" />
                    )}
                    {isSubmitted && isSelected && !optionIsCorrect && (
                      <XCircle size={16} className="text-danger shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {isSubmitted && (
              <p
                className={`mt-2 text-[12px] ${
                  isCorrect ? "text-success" : isWrong ? "text-danger" : "text-ink-tertiary"
                }`}
              >
                {isCorrect
                  ? "Correct!"
                  : isWrong
                    ? `Incorrect. The correct answer is: ${q.options[q.correctIndex]}`
                    : "Not answered"}
              </p>
            )}
          </div>
        )
      })}

      {!isSubmitted && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || Object.keys(answers).length < questions.length
            }
          >
            <Send size={14} className="mr-1.5" />
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </Button>

          {Object.keys(answers).length < questions.length && (
            <span className="text-[12px] text-ink-tertiary">
              {Object.keys(answers).length} of {questions.length} answered
            </span>
          )}
        </div>
      )}

      {isSubmitted && (
        <p className="text-[13px] text-success">Quiz submitted!</p>
      )}

      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  )
}
