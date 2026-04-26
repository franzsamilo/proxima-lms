"use client"

import { useEffect, useState, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, AlertOctagon } from "lucide-react"
import { ViewerShell } from "./viewer-shell"
import { Telemetry } from "@/components/ui/telemetry"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

// Self-host worker via CDN matching the bundled version. Avoids Next.js bundler interactions.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

interface PdfViewerProps {
  fileUrl: string
  fileName: string
  fileSize?: number | null
}

export function PdfViewer({ fileUrl, fileName, fileSize }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPageNumber(1)
  }, [fileUrl])

  return (
    <ViewerShell
      fileName={fileName}
      fileSize={fileSize}
      fileUrl={fileUrl}
      kind="pdf"
      status={error ? "danger" : "live"}
      toolbarExtras={
        <>
          <button
            type="button"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!numPages || pageNumber <= 1}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-signal hover:bg-surface-3 disabled:opacity-40 disabled:hover:text-ink-tertiary disabled:hover:bg-transparent transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-[family-name:var(--font-family-mono)] text-[11px] tabular text-ink-secondary px-2">
            {String(pageNumber).padStart(2, "0")}
            <span className="text-ink-ghost"> / {numPages ? String(numPages).padStart(2, "0") : "—"}</span>
          </span>
          <button
            type="button"
            onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p))}
            disabled={!numPages || pageNumber >= numPages}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-signal hover:bg-surface-3 disabled:opacity-40 disabled:hover:text-ink-tertiary disabled:hover:bg-transparent transition-colors"
            title="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <span className="w-px h-5 bg-edge mx-1" />
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-signal hover:bg-surface-3 transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="font-[family-name:var(--font-family-mono)] text-[10px] tabular text-ink-tertiary w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-ink-tertiary hover:text-signal hover:bg-surface-3 transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
          <span className="w-px h-5 bg-edge mx-1" />
        </>
      }
    >
      <div ref={containerRef} className="h-full overflow-auto flex justify-center bg-surface-0/60 p-4">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages)
            setError(null)
          }}
          onLoadError={(e) => setError(e.message)}
          loading={
            <div className="flex items-center gap-3 text-ink-tertiary py-20">
              <Loader2 size={16} className="animate-spin text-signal" />
              <Telemetry className="text-ink-tertiary">DECODING PDF…</Telemetry>
            </div>
          }
          error={
            <div className="flex flex-col items-center gap-3 text-ink-tertiary py-20 max-w-md text-center">
              <AlertOctagon size={20} className="text-danger" />
              <Telemetry className="text-danger">FAILED TO LOAD PDF</Telemetry>
              <p className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">
                {error ?? "The viewer could not decode this file. Try downloading it instead."}
              </p>
            </div>
          }
        >
          {numPages && (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderAnnotationLayer
              renderTextLayer
              className="shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            />
          )}
        </Document>
      </div>
    </ViewerShell>
  )
}
