"use client"

import * as React from "react"
import { AddLessonForm } from "@/components/courses/add-lesson-form"
import { EditLessonModal } from "@/components/courses/edit-lesson-modal"
import { FileText, Code2, HelpCircle, ClipboardList, Video } from "lucide-react"

interface Lesson {
  id: string
  title: string
  type: string
  order: number
  durationMins: number
  content: any
  codeSkeleton: string | null
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface ModulesEditorProps {
  modules: Module[]
}

const typeIcons: Record<string, React.ElementType> = {
  SLIDES: FileText,
  CODE: Code2,
  QUIZ: HelpCircle,
  TASK: ClipboardList,
  VIDEO: Video,
}

const typeColors: Record<string, string> = {
  SLIDES: "text-ink-tertiary",
  CODE: "text-info",
  QUIZ: "text-warning",
  TASK: "text-success",
  VIDEO: "text-purple",
}

export function ModulesEditor({ modules }: ModulesEditorProps) {
  const [editingLesson, setEditingLesson] = React.useState<Lesson | null>(null)

  return (
    <>
      {modules.length === 0 ? (
        <p className="text-[13px] text-ink-tertiary mb-4">
          No modules yet. Add a module to get started.
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="rounded-[var(--radius-md)] border border-edge p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-[family-name:var(--font-family-mono)] text-[12px] font-bold text-signal bg-signal-muted w-6 h-6 rounded flex items-center justify-center">
                  {mod.order}
                </span>
                <span className="font-[family-name:var(--font-family-body)] text-[14px] font-medium text-ink-primary">
                  {mod.title}
                </span>
              </div>

              {mod.lessons.length > 0 && (
                <ul className="ml-8 space-y-1 mb-2">
                  {mod.lessons.map((lesson) => {
                    const Icon = typeIcons[lesson.type] ?? FileText
                    const color = typeColors[lesson.type] ?? "text-ink-tertiary"
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => setEditingLesson(lesson)}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 -mx-2 rounded-[var(--radius-sm)] hover:bg-surface-3 transition-colors group cursor-pointer"
                        >
                          <Icon size={14} className={color} />
                          <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary group-hover:text-ink-primary transition-colors">
                            {lesson.order}. {lesson.title}
                          </span>
                          <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost ml-auto">
                            {lesson.type}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              <AddLessonForm moduleId={mod.id} />
            </div>
          ))}
        </div>
      )}

      <EditLessonModal
        open={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        lesson={editingLesson}
      />
    </>
  )
}
