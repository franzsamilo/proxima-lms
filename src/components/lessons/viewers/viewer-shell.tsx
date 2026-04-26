"use client"

import * as React from "react"
import { Download, ExternalLink, FileText, Maximize2 } from "lucide-react"
import { Telemetry } from "@/components/ui/telemetry"
import { ProtocolBadge } from "@/components/ui/protocol-badge"
import { StatusPip } from "@/components/ui/status-dot"
import { formatBytes, KIND_LABEL, type FileKind } from "@/lib/file-types"
import { cn } from "@/lib/utils"

interface ViewerShellProps {
  fileName: string
  fileSize?: number | null
  fileUrl: string
  kind: FileKind
  status?: "live" | "warn" | "danger" | "idle"
  toolbarExtras?: React.ReactNode
  children: React.ReactNode
  fullscreenable?: boolean
  className?: string
}

export function ViewerShell({
  fileName,
  fileSize,
  fileUrl,
  kind,
  status = "live",
  toolbarExtras,
  children,
  fullscreenable = true,
  className,
}: ViewerShellProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  return (
    <div
      className={cn(
        "relative flex flex-col bg-surface-2 border border-edge rounded-[6px] overflow-hidden bracket-frame-4",
        isFullscreen && "fixed inset-4 z-50 shadow-[0_24px_64px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      <span className="bracket tl" />
      <span className="bracket tr" />
      <span className="bracket bl" />
      <span className="bracket br" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-edge bg-surface-1/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={14} className="text-signal shrink-0" />
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-family-mono)] text-[12px] text-ink-primary truncate">
              {fileName}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <ProtocolBadge tone="signal">{KIND_LABEL[kind]}</ProtocolBadge>
              {fileSize != null && (
                <Telemetry className="text-ink-ghost">{formatBytes(fileSize)}</Telemetry>
              )}
              <StatusPip status={status} label={status === "live" ? "READY" : status.toUpperCase()} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {toolbarExtras}
          {fullscreenable && (
            <ToolButton onClick={() => setIsFullscreen((s) => !s)} title="Toggle fullscreen">
              <Maximize2 size={13} />
            </ToolButton>
          )}
          <ToolButton as="a" href={fileUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab">
            <ExternalLink size={13} />
          </ToolButton>
          <ToolButton as="a" href={fileUrl} download={fileName} title="Download">
            <Download size={13} />
          </ToolButton>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 min-h-[480px] bg-surface-0/80 overflow-hidden">{children}</div>
    </div>
  )
}

interface ToolButtonProps {
  onClick?: () => void
  href?: string
  target?: string
  rel?: string
  title?: string
  download?: string
  as?: "button" | "a"
  children: React.ReactNode
}

function ToolButton({ as = "button", children, ...props }: ToolButtonProps) {
  const cls =
    "inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-signal hover:bg-surface-3 transition-colors cursor-pointer"
  if (as === "a") {
    return (
      <a className={cls} {...props}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  )
}
