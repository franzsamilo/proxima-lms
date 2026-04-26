"use client"

import dynamic from "next/dynamic"
import { detectFileKind } from "@/lib/file-types"
import { ImageViewer } from "./viewers/image-viewer"
import { VideoViewer } from "./viewers/video-viewer"
import { AudioViewer } from "./viewers/audio-viewer"
import { GenericViewer } from "./viewers/generic-viewer"
import { TextViewer } from "./viewers/text-viewer"
import { ViewerShell } from "./viewers/viewer-shell"
import { Loader2 } from "lucide-react"
import { Telemetry } from "@/components/ui/telemetry"

// Heavy viewers loaded only on demand
const PdfViewer = dynamic(() => import("./viewers/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <ViewerLoading label="LOADING PDF VIEWER" />
  ),
})
const DocxViewer = dynamic(() => import("./viewers/docx-viewer").then((m) => m.DocxViewer), {
  ssr: false,
  loading: () => <ViewerLoading label="LOADING DOCX VIEWER" />,
})
const PptxViewer = dynamic(() => import("./viewers/pptx-viewer").then((m) => m.PptxViewer), {
  ssr: false,
  loading: () => <ViewerLoading label="LOADING PPTX VIEWER" />,
})

function ViewerLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 min-h-[480px] bg-surface-2 border border-edge rounded-[6px]">
      <Loader2 size={16} className="animate-spin text-signal" />
      <Telemetry className="text-ink-tertiary">{label}</Telemetry>
    </div>
  )
}

interface FileViewerProps {
  fileUrl: string
  fileName: string
  fileMime?: string | null
  fileSize?: number | null
}

export function FileViewer({ fileUrl, fileName, fileMime, fileSize }: FileViewerProps) {
  const kind = detectFileKind({ mime: fileMime, name: fileName })

  if (!fileUrl) {
    return (
      <ViewerShell fileName={fileName || "untitled"} fileUrl="" kind="other" status="danger" fullscreenable={false}>
        <div className="flex items-center justify-center min-h-[200px] text-ink-tertiary">
          <Telemetry className="text-danger">NO FILE ATTACHED</Telemetry>
        </div>
      </ViewerShell>
    )
  }

  const props = { fileUrl, fileName, fileSize: fileSize ?? null }

  switch (kind) {
    case "pdf":
      return <PdfViewer {...props} />
    case "docx":
      return <DocxViewer {...props} />
    case "pptx":
      return <PptxViewer {...props} />
    case "image":
      return <ImageViewer {...props} />
    case "video":
      return <VideoViewer {...props} />
    case "audio":
      return <AudioViewer {...props} />
    case "text":
    case "code":
    case "csv":
      return <TextViewer {...props} kind={kind} />
    case "xlsx":
    case "archive":
    case "other":
    default:
      return <GenericViewer {...props} kind={kind} />
  }
}
