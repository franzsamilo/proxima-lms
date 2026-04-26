"use client"

import { Download, FileQuestion } from "lucide-react"
import { ViewerShell } from "./viewer-shell"
import { Telemetry } from "@/components/ui/telemetry"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { KIND_LABEL, type FileKind } from "@/lib/file-types"

interface GenericViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
  kind: FileKind
}

export function GenericViewer({ fileUrl, fileName, fileSize, kind }: GenericViewerProps) {
  return (
    <ViewerShell fileName={fileName} fileSize={fileSize} fileUrl={fileUrl} kind={kind} status="warn">
      <div className="h-full flex flex-col items-center justify-center gap-5 p-10 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-[6px] bg-surface-3 border border-edge flex items-center justify-center">
          <FileQuestion size={26} className="text-ink-tertiary" />
        </div>
        <div className="space-y-2">
          <Telemetry className="text-warning">PREVIEW NOT SUPPORTED</Telemetry>
          <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-secondary">
            <span className="text-ink-primary">{KIND_LABEL[kind]}</span> files cannot be rendered
            in-browser. Download the file to open it locally.
          </p>
        </div>
        <a href={fileUrl} download={fileName}>
          <ProtocolButton variant="primary" size="md">
            <Download size={13} /> DOWNLOAD FILE
          </ProtocolButton>
        </a>
      </div>
    </ViewerShell>
  )
}
