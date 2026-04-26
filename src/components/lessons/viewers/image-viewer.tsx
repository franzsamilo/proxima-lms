"use client"

/* eslint-disable @next/next/no-img-element */
import { ViewerShell } from "./viewer-shell"

interface ImageViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
}

export function ImageViewer({ fileUrl, fileName, fileSize }: ImageViewerProps) {
  return (
    <ViewerShell fileName={fileName} fileSize={fileSize} fileUrl={fileUrl} kind="image">
      <div className="h-full flex items-center justify-center bg-surface-0/80 p-6">
        <img
          src={fileUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        />
      </div>
    </ViewerShell>
  )
}
