import * as React from "react"

export interface CodeViewerProps {
  code: string
  language?: string
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  return (
    <div className="bg-[#0D1117] border border-edge rounded-[var(--radius-md)] p-4 overflow-hidden">
      {language && (
        <div className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-ghost mb-2 uppercase tracking-[1px]">
          {language}
        </div>
      )}
      <pre className="m-0 font-[family-name:var(--font-family-mono)] text-[13px] font-normal leading-[1.7] text-[#C9D1D9] overflow-x-auto whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
    </div>
  )
}
