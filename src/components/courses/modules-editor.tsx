"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AddLessonForm } from "@/components/courses/add-lesson-form"
import { EditLessonModal } from "@/components/courses/edit-lesson-modal"
import { reorderModules, deleteModule } from "@/actions/module-actions"
import { reorderLessons, deleteLesson } from "@/actions/lesson-actions"
import { FileText, Code2, HelpCircle, ClipboardList, Video, ChevronUp, ChevronDown, Trash2, AlertCircle } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

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
  courseId: string
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

function hasContent(lesson: Lesson): boolean {
  const c = lesson.content
  if (!c) return false
  switch (lesson.type) {
    case "SLIDES": return Array.isArray(c.slides) && c.slides.length > 0
    case "CODE": return !!(c.brief || lesson.codeSkeleton)
    case "QUIZ": return Array.isArray(c.questions) && c.questions.length > 0
    case "TASK": return !!(c.brief)
    case "VIDEO": return !!(c.videoUrl)
    default: return false
  }
}

export function ModulesEditor({ modules, courseId }: ModulesEditorProps) {
  const [editingLesson, setEditingLesson] = React.useState<Lesson | null>(null)
  const [confirmDeleteModule, setConfirmDeleteModule] = React.useState<Module | null>(null)
  const [confirmDeleteLesson, setConfirmDeleteLesson] = React.useState<{ lesson: Lesson; moduleId: string } | null>(null)
  const router = useRouter()

  async function handleModuleMove(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1
    const ids = modules.map((m) => m.id)
    ;[ids[index], ids[newIndex]] = [ids[newIndex], ids[index]]
    await reorderModules(courseId, ids)
    router.refresh()
  }

  async function handleLessonMove(mod: Module, lessonIndex: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? lessonIndex - 1 : lessonIndex + 1
    const ids = mod.lessons.map((l) => l.id)
    ;[ids[lessonIndex], ids[newIndex]] = [ids[newIndex], ids[lessonIndex]]
    await reorderLessons(mod.id, ids)
    router.refresh()
  }

  return (
    <>
      {modules.length === 0 ? (
        <p className="text-[13px] text-ink-tertiary mb-4">
          No modules yet. Add a module to get started.
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="rounded-[var(--radius-md)] border border-edge p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-[family-name:var(--font-family-mono)] text-[12px] font-bold text-signal bg-signal-muted w-6 h-6 rounded flex items-center justify-center">
                  {modIdx + 1}
                </span>
                <span className="font-[family-name:var(--font-family-body)] text-[14px] font-medium text-ink-primary flex-1">
                  {mod.title}
                </span>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => handleModuleMove(modIdx, "up")}
                    disabled={modIdx === 0}
                    className="p-1 text-ink-ghost hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move module up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleModuleMove(modIdx, "down")}
                    disabled={modIdx === modules.length - 1}
                    className="p-1 text-ink-ghost hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move module down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteModule(mod)}
                    className="p-1 text-ink-ghost hover:text-danger transition-colors"
                    aria-label="Delete module"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {mod.lessons.length > 0 && (
                <ul className="ml-8 space-y-0.5 mb-2">
                  {mod.lessons.map((lesson, lessonIdx) => {
                    const Icon = typeIcons[lesson.type] ?? FileText
                    const color = typeColors[lesson.type] ?? "text-ink-tertiary"
                    return (
                      <li key={lesson.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingLesson(lesson)}
                          className="flex items-center gap-2 flex-1 text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-surface-3 transition-colors group cursor-pointer"
                        >
                          <Icon size={14} className={color} />
                          <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary group-hover:text-ink-primary transition-colors">
                            {lesson.title}
                          </span>
                          {!hasContent(lesson) && (
                            <AlertCircle size={12} className="text-warning shrink-0" title="No content — click to add" />
                          )}
                          <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost ml-auto">
                            {lesson.type}
                          </span>
                        </button>
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            onClick={() => handleLessonMove(mod, lessonIdx, "up")}
                            disabled={lessonIdx === 0}
                            className="p-0.5 text-ink-ghost hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Move lesson up"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => handleLessonMove(mod, lessonIdx, "down")}
                            disabled={lessonIdx === mod.lessons.length - 1}
                            className="p-0.5 text-ink-ghost hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Move lesson down"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteLesson({ lesson, moduleId: mod.id })}
                            className="p-0.5 text-ink-ghost hover:text-danger transition-colors"
                            aria-label="Delete lesson"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
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

      <ConfirmationDialog
        open={!!confirmDeleteModule}
        onClose={() => setConfirmDeleteModule(null)}
        onConfirm={async () => {
          if (confirmDeleteModule) {
            await deleteModule(confirmDeleteModule.id)
            router.refresh()
          }
        }}
        title="Delete Module"
        message={`Delete "${confirmDeleteModule?.title}" and all its lessons? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <ConfirmationDialog
        open={!!confirmDeleteLesson}
        onClose={() => setConfirmDeleteLesson(null)}
        onConfirm={async () => {
          if (confirmDeleteLesson) {
            await deleteLesson(confirmDeleteLesson.lesson.id)
            router.refresh()
          }
        }}
        title="Delete Lesson"
        message={`Delete "${confirmDeleteLesson?.lesson.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <EditLessonModal
        open={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        lesson={editingLesson}
      />
    </>
  )
}
