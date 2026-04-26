"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Loader2, AlertOctagon } from "lucide-react"
import { ViewerShell } from "./viewer-shell"
import { Telemetry } from "@/components/ui/telemetry"
import type { FileKind } from "@/lib/file-types"

interface TextViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
  kind: FileKind
}

const MAX_BYTES = 1_000_000 // refuse to load enormous text files in-browser

function looksLikeMarkdown(name: string) {
  return /\.(md|markdown)$/i.test(name)
}

export function TextViewer({ fileUrl, fileName, fileSize, kind }: TextViewerProps) {
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (fileSize && fileSize > MAX_BYTES) {
      setError(`File too large to preview inline (${(fileSize / 1_000_000).toFixed(1)} MB). Download to view.`)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
        return res.text()
      })
      .then((t) => {
        if (cancelled) return
        setText(t)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Could not load file")
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fileUrl, fileSize])

  const isMd = looksLikeMarkdown(fileName)

  return (
    <ViewerShell fileName={fileName} fileSize={fileSize} fileUrl={fileUrl} kind={kind} status={error ? "danger" : "live"}>
      <div className="h-full overflow-auto p-6 bg-surface-0/40">
        {loading && (
          <div className="flex items-center justify-center gap-3 text-ink-tertiary py-20">
            <Loader2 size={16} className="animate-spin text-signal" />
            <Telemetry className="text-ink-tertiary">LOADING TEXT…</Telemetry>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center gap-3 text-ink-tertiary py-20 max-w-md mx-auto text-center">
            <AlertOctagon size={20} className="text-danger" />
            <Telemetry className="text-danger">UNABLE TO PREVIEW</Telemetry>
            <p className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">{error}</p>
          </div>
        )}
        {text != null && !loading && !error && (
          isMd ? (
            <article className="max-w-3xl mx-auto bg-surface-2 rounded-[4px] border border-edge p-8 md:p-10 prose prose-invert text-ink-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </article>
          ) : (
            <pre className="max-w-5xl mx-auto bg-[#0D1117] border border-edge rounded-[4px] p-5 font-[family-name:var(--font-family-mono)] text-[12px] leading-[1.7] text-[#C9D1D9] whitespace-pre-wrap break-words overflow-x-auto">
              {text}
            </pre>
          )
        )}
      </div>
    </ViewerShell>
  )
}
