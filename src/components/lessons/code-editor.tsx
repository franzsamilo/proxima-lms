"use client"

import { useState } from "react"
import Editor, { type BeforeMount } from "@monaco-editor/react"
import { submitTask } from "@/actions/task-actions"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("proxima-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: { "editor.background": "#0D1117" },
  })
}

interface CodeEditorProps {
  codeSkeleton?: string
  lessonId: string
  existingCode?: string
  brief?: string
  hints?: string[]
}

export function CodeEditor({
  codeSkeleton,
  lessonId,
  existingCode,
  brief,
  hints,
}: CodeEditorProps) {
  const [code, setCode] = useState(existingCode ?? codeSkeleton ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
  } | null>(null)

  async function handleSubmit() {
    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData()
    formData.set("lessonId", lessonId)
    formData.set("codeContent", code)

    const res = await submitTask(formData)

    if (res && "error" in res) {
      const resErr = (res as { error: unknown }).error
      setResult({ error: typeof resErr === "string" ? resErr : "Submission failed" })
    } else {
      setResult({ success: true })
    }

    setIsSubmitting(false)
  }

  return (
    <div>
      {/* Brief and hints */}
      {brief && (
        <div className="mb-4">
          <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary mb-1">
            Brief
          </h3>
          <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
            {brief}
          </p>
        </div>
      )}

      {hints && hints.length > 0 && (
        <div className="mb-4">
          <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary mb-1">
            Hints
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {hints.map((hint, i) => (
              <li
                key={i}
                className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary"
              >
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Editor */}
      <div className="rounded-[var(--radius-lg)] border border-edge overflow-hidden mb-4">
        <Editor
          height="450px"
          defaultLanguage="python"
          value={code}
          onChange={(val) => setCode(val ?? "")}
          beforeMount={handleBeforeMount}
          theme="proxima-dark"
          options={{
            fontSize: 14,
            fontFamily: "var(--font-family-mono)",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Send size={14} className="mr-1.5" />
          {isSubmitting ? "Submitting..." : "Submit Code"}
        </Button>

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
