"use client"

import { useState } from "react"
import { Loader2, AlertOctagon, Presentation } from "lucide-react"
import { ViewerShell } from "./viewer-shell"
import { Telemetry } from "@/components/ui/telemetry"
import { ProtocolButton } from "@/components/ui/protocol-button"

interface PptxViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
}

/**
 * PPTX rendering in-browser is unreliable (font/animation fidelity loss). The pragmatic
 * approach: embed Microsoft Office Online's read-only viewer via an iframe. It requires
 * the file URL to be publicly reachable (UploadThing serves files publicly by default).
 */
export function PptxViewer({ fileUrl, fileName, fileSize }: PptxViewerProps) {
  const embedSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <ViewerShell
      fileName={fileName}
      fileSize={fileSize}
      fileUrl={fileUrl}
      kind="pptx"
      status={errored ? "danger" : loaded ? "live" : "warn"}
      toolbarExtras={
        <Telemetry className="text-ink-tertiary px-2 hidden md:block">VIA OFFICE 365</Telemetry>
      }
    >
      <div className="relative h-full">
        {!loaded && !errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-tertiary z-10 bg-surface-0/40 backdrop-blur-sm">
            <Loader2 size={18} className="animate-spin text-signal" />
            <Telemetry className="text-ink-tertiary">RENDERING SLIDES…</Telemetry>
            <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost text-center max-w-xs">
              Microsoft Office Online is processing the file. May take a few seconds.
            </p>
          </div>
        )}
        {errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-tertiary p-8 text-center max-w-md mx-auto">
            <AlertOctagon size={20} className="text-danger" />
            <Telemetry className="text-danger">VIEWER UNAVAILABLE</Telemetry>
            <p className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">
              The Office Online viewer could not render this file. Download it to view in PowerPoint.
            </p>
            <a href={fileUrl} download={fileName}>
              <ProtocolButton variant="primary" size="sm">DOWNLOAD</ProtocolButton>
            </a>
          </div>
        )}
        <iframe
          key={fileUrl}
          src={embedSrc}
          title={fileName}
          className="w-full h-full bg-surface-0 border-0"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          allow="fullscreen"
        />
      </div>

      {/* Decorative corner */}
      <Presentation size={0} aria-hidden />
    </ViewerShell>
  )
}
