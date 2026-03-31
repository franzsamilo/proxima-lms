"use client"

import * as React from "react"

export interface VideoPlayerProps {
  src: string
  title?: string
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  return (
    <div
      style={{
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "#000",
        border: "1px solid var(--color-edge)",
      }}
    >
      <video
        src={src}
        controls
        title={title}
        style={{
          width: "100%",
          display: "block",
          maxHeight: "480px",
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
