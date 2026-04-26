"use client"

import { Music } from "lucide-react"
import { ViewerShell } from "./viewer-shell"

interface AudioViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
}

export function AudioViewer({ fileUrl, fileName, fileSize }: AudioViewerProps) {
  return (
    <ViewerShell fileName={fileName} fileSize={fileSize} fileUrl={fileUrl} kind="audio">
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-24 h-24 rounded-full bg-signal-muted border border-signal/30 flex items-center justify-center">
          <Music size={32} className="text-signal" />
        </div>
        <div className="text-center">
          <div className="font-[family-name:var(--font-family-display)] text-[18px] text-ink-primary font-semibold tracking-tight">
            {fileName}
          </div>
        </div>
        <audio src={fileUrl} controls className="w-full max-w-md" />
      </div>
    </ViewerShell>
  )
}
