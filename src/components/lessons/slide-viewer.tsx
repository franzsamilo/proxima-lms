"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlideViewerProps {
  slides: { title: string; body: string }[]
}

export function SlideViewer({ slides }: SlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!slides || slides.length === 0) {
    return (
      <p className="text-[14px] text-ink-tertiary text-center py-8">
        No slides available.
      </p>
    )
  }

  const slide = slides[currentIndex]

  return (
    <div>
      {/* Navigation header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous
        </Button>

        <span className="font-[family-name:var(--font-family-mono)] text-[13px] text-ink-tertiary">
          Slide {currentIndex + 1} of {slides.length}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setCurrentIndex((i) => Math.min(slides.length - 1, i + 1))
          }
          disabled={currentIndex === slides.length - 1}
        >
          Next
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>

      {/* Slide content */}
      <div className="rounded-[var(--radius-lg)] border border-edge bg-surface-2 p-8 min-h-[400px]">
        <h2 className="font-[family-name:var(--font-family-display)] text-[18px] font-bold text-ink-primary mb-6">
          {slide.title}
        </h2>

        <div className="prose prose-invert max-w-none font-[family-name:var(--font-family-body)] text-ink-secondary text-[14px] leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {slide.body}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
