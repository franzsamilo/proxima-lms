"use client"

import { useEffect, useState } from "react"
import mammoth from "mammoth"
import { AlertOctagon, Loader2 } from "lucide-react"
import { ViewerShell } from "./viewer-shell"
import { Telemetry } from "@/components/ui/telemetry"

interface DocxViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
}

export function DocxViewer({ fileUrl, fileName, fileSize }: DocxViewerProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [warnings, setWarnings] = useState<number>(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setHtml(null)

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
        return res.arrayBuffer()
      })
      .then((buffer) => mammoth.convertToHtml({ arrayBuffer: buffer }))
      .then((result) => {
        if (cancelled) return
        setHtml(result.value)
        setWarnings(result.messages.length)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not parse document")
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fileUrl])

  return (
    <ViewerShell
      fileName={fileName}
      fileSize={fileSize}
      fileUrl={fileUrl}
      kind="docx"
      status={error ? "danger" : warnings > 0 ? "warn" : "live"}
      toolbarExtras={
        warnings > 0 ? (
          <Telemetry className="text-warning px-2">{warnings} FORMAT WARN</Telemetry>
        ) : null
      }
    >
      <div className="h-full overflow-auto bg-surface-0/40 p-6">
        {loading && (
          <div className="flex items-center justify-center gap-3 text-ink-tertiary py-20">
            <Loader2 size={16} className="animate-spin text-signal" />
            <Telemetry className="text-ink-tertiary">PARSING DOCUMENT…</Telemetry>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center gap-3 text-ink-tertiary py-20 max-w-md mx-auto text-center">
            <AlertOctagon size={20} className="text-danger" />
            <Telemetry className="text-danger">FAILED TO PARSE</Telemetry>
            <p className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">
              {error}. Try downloading the file instead.
            </p>
          </div>
        )}
        {html && !loading && (
          <article
            className="docx-content max-w-3xl mx-auto bg-surface-2 rounded-[4px] border border-edge p-8 md:p-10 prose prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
      <style>{`
        .docx-content { color: var(--color-ink-primary); font-family: var(--font-family-body); font-size: 14px; line-height: 1.7; }
        .docx-content h1 { font-family: var(--font-family-display); font-size: 28px; font-weight: 700; color: var(--color-ink-primary); margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em; }
        .docx-content h2 { font-family: var(--font-family-display); font-size: 22px; font-weight: 600; color: var(--color-ink-primary); margin-top: 28px; margin-bottom: 12px; letter-spacing: -0.01em; }
        .docx-content h3 { font-family: var(--font-family-display); font-size: 18px; font-weight: 600; color: var(--color-ink-primary); margin-top: 24px; margin-bottom: 8px; }
        .docx-content p { margin-bottom: 12px; color: var(--color-ink-secondary); }
        .docx-content ul, .docx-content ol { margin-left: 1.4em; margin-bottom: 12px; color: var(--color-ink-secondary); }
        .docx-content li { margin-bottom: 4px; }
        .docx-content a { color: var(--color-signal); text-decoration: underline; }
        .docx-content strong { color: var(--color-ink-primary); font-weight: 600; }
        .docx-content table { border-collapse: collapse; margin: 16px 0; width: 100%; }
        .docx-content th, .docx-content td { border: 1px solid var(--color-edge); padding: 8px 12px; text-align: left; font-size: 13px; }
        .docx-content th { background: var(--color-surface-3); color: var(--color-ink-primary); font-weight: 600; }
        .docx-content blockquote { border-left: 3px solid var(--color-signal); padding-left: 16px; margin: 16px 0; color: var(--color-ink-tertiary); font-style: italic; }
        .docx-content img { max-width: 100%; height: auto; border-radius: 4px; margin: 12px 0; }
        .docx-content hr { border: none; border-top: 1px solid var(--color-edge); margin: 24px 0; }
      `}</style>
    </ViewerShell>
  )
}
