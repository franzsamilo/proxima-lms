"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { LessonItem } from "./lesson-item"

interface ModuleAccordionProps {
  module: {
    id: string
    title: string
    order: number
    lessons: {
      id: string
      title: string
      type: string
      durationMins: number
      order: number
    }[]
  }
  defaultOpen?: boolean
}

export function ModuleAccordion({
  module,
  defaultOpen = false,
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const sortedLessons = [...module.lessons].sort((a, b) => a.order - b.order)

  return (
    <div className="rounded-[var(--radius-lg)] border border-edge overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 bg-surface-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-3/80"
      >
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-signal-muted flex items-center justify-center shrink-0">
          <span className="font-[family-name:var(--font-family-mono)] text-[12px] font-bold text-signal">
            {module.order}
          </span>
        </div>

        <span className="font-[family-name:var(--font-family-body)] text-[14px] font-semibold text-ink-primary flex-1 text-left">
          {module.title}
        </span>

        <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary mr-2">
          {module.lessons.length}{" "}
          {module.lessons.length === 1 ? "lesson" : "lessons"}
        </span>

        <ChevronDown
          size={16}
          className={`text-ink-tertiary transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="divide-y divide-edge">
          {sortedLessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} />
          ))}
          {sortedLessons.length === 0 && (
            <p className="px-4 py-3 text-[13px] text-ink-tertiary text-center">
              No lessons in this module yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
