"use client"

import { ViewerShell } from "./viewer-shell"

interface VideoViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
}

export function VideoViewer({ fileUrl, fileName, fileSize }: VideoViewerProps) {
  return (
    <ViewerShell fileName={fileName} fileSize={fileSize} fileUrl={fileUrl} kind="video">
      <div className="h-full flex items-center justify-center bg-surface-0 p-2">
        <video
          src={fileUrl}
          controls
          className="max-w-full max-h-full rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          Your browser does not support video playback.
        </video>
      </div>
    </ViewerShell>
  )
}
