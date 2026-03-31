import * as React from "react"

export interface CodeViewerProps {
  code: string
  language?: string
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  return (
    <div
      style={{
        background: "#0D1117",
        border: "1px solid var(--color-edge)",
        borderRadius: "var(--radius-md)",
        padding: "16px",
        overflow: "hidden",
      }}
    >
      {language && (
        <div
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "11px",
            color: "var(--color-ink-ghost)",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {language}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          fontFamily: "var(--font-family-mono)",
          fontSize: "13px",
          fontWeight: 400,
          color: "#C9D1D9",
          lineHeight: 1.7,
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
