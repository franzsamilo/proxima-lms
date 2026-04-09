"use client"

import * as React from "react"

export interface VideoPlayerProps {
  src: string
  title?: string
  poster?: string
  captionsUrl?: string
}

export function VideoPlayer({
  src,
  title,
  poster,
  captionsUrl,
}: VideoPlayerProps) {
  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden bg-black border border-edge">
      <video
        src={src}
        controls
        preload="metadata"
        poster={poster}
        aria-label={title ?? "Submission video"}
        className="w-full block max-h-[480px]"
      >
        {captionsUrl && (
          <track
            kind="captions"
            srcLang="en"
            label="English"
            src={captionsUrl}
            default
          />
        )}
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
