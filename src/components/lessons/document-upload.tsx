"use client"

import { useState, useRef } from "react"
import { useUploadThing } from "@/lib/uploadthing"
import { Upload, FileCheck2, AlertOctagon, X, Loader2, Replace } from "lucide-react"
import { Telemetry } from "@/components/ui/telemetry"
import { ProtocolBadge } from "@/components/ui/protocol-badge"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { detectFileKind, formatBytes, KIND_LABEL } from "@/lib/file-types"
import { cn } from "@/lib/utils"

export interface DocumentMeta {
  url: string
  name: string
  size: number
  mime: string
}

interface DocumentUploadProps {
  value?: DocumentMeta | null
  onChange: (doc: DocumentMeta | null) => void
  className?: string
}

export function DocumentUpload({ value, onChange, className }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("documentUploader", {
    onClientUploadComplete: (res) => {
      const file = res?.[0]
      if (!file) return
      onChange({
        url: file.url,
        name: file.name,
        size: file.size,
        mime: file.type ?? "application/octet-stream",
      })
      setError(null)
    },
    onUploadError: (e) => {
      setError(e.message ?? "Upload failed")
    },
  })

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    void startUpload([files[0]])
  }

  if (value) {
    const kind = detectFileKind({ mime: value.mime, name: value.name })
    return (
      <div
        className={cn(
          "relative flex items-start gap-3 p-4 bg-surface-1 border border-edge rounded-[6px] bracket-frame-4",
          className
        )}
      >
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
        <div className="w-10 h-10 rounded bg-success-tint border border-success/30 flex items-center justify-center shrink-0">
          <FileCheck2 size={16} className="text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[family-name:var(--font-family-mono)] text-[12px] text-ink-primary truncate">
            {value.name}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <ProtocolBadge tone="success" dot>{KIND_LABEL[kind]}</ProtocolBadge>
            <Telemetry className="text-ink-tertiary">{formatBytes(value.size)}</Telemetry>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-signal hover:bg-surface-3 transition-colors disabled:opacity-50"
            title="Replace file"
          >
            {isUploading ? <Loader2 size={13} className="animate-spin text-signal" /> : <Replace size={13} />}
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
            title="Remove"
          >
            <X size={13} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-[6px] border border-dashed transition-all cursor-pointer bracket-frame-4",
          isDragging
            ? "border-signal bg-signal-muted"
            : "border-edge bg-surface-1/60 hover:border-signal/40 hover:bg-surface-2/60"
        )}
      >
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />

        <div className="w-12 h-12 rounded-full bg-signal-muted border border-signal/30 flex items-center justify-center">
          {isUploading ? (
            <Loader2 size={20} className="text-signal animate-spin" />
          ) : (
            <Upload size={20} className="text-signal" />
          )}
        </div>

        <div className="text-center">
          <Telemetry className={cn("block mb-1", isDragging ? "text-signal" : "text-ink-secondary")}>
            {isUploading ? "UPLOADING…" : isDragging ? "RELEASE TO UPLOAD" : "DRAG FILE OR CLICK TO BROWSE"}
          </Telemetry>
          <p className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-tertiary tracking-[0.12em]">
            PDF · DOCX · PPTX · XLSX · IMAGES · VIDEO · AUDIO · UP TO 256 MB
          </p>
        </div>

        <ProtocolButton
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
          disabled={isUploading}
        >
          {isUploading ? "UPLOADING" : "SELECT FILE"}
        </ProtocolButton>
      </div>

      {error && (
        <div className="flex items-start gap-2 mt-3 p-3 rounded border border-danger/40 bg-danger-tint">
          <AlertOctagon size={14} className="mt-0.5 shrink-0 text-danger" />
          <p className="font-[family-name:var(--font-family-mono)] text-[11px] text-danger leading-relaxed">{error}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
