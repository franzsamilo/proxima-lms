"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { updateLesson } from "@/actions/lesson-actions"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { DocumentUpload, type DocumentMeta } from "@/components/lessons/document-upload"

interface Lesson {
  id: string
  title: string
  type: string
  durationMins: number
  content: any
  codeSkeleton: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileMime?: string | null
  fileSize?: number | null
}

interface EditLessonModalProps {
  open: boolean
  onClose: () => void
  lesson: Lesson | null
}

export function EditLessonModal({ open, onClose, lesson }: EditLessonModalProps) {
  const [title, setTitle] = React.useState("")
  const [durationMins, setDurationMins] = React.useState(30)
  const [content, setContent] = React.useState<any>(null)
  const [codeSkeleton, setCodeSkeleton] = React.useState("")
  const [doc, setDoc] = React.useState<DocumentMeta | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const { showToast, toastProps } = useToast()
  const router = useRouter()

  React.useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setDurationMins(lesson.durationMins)
      setContent(lesson.content ?? getDefaultContent(lesson.type))
      setCodeSkeleton(lesson.codeSkeleton ?? "")
      setDoc(
        lesson.fileUrl && lesson.fileName
          ? {
              url: lesson.fileUrl,
              name: lesson.fileName,
              size: lesson.fileSize ?? 0,
              mime: lesson.fileMime ?? "application/octet-stream",
            }
          : null
      )
    }
  }, [lesson])

  function getDefaultContent(type: string) {
    switch (type) {
      case "SLIDES": return { slides: [{ title: "", body: "" }] }
      case "CODE": return { brief: "", hints: [] }
      case "QUIZ": return { questions: [] }
      case "TASK": return { brief: "", requirements: [], rubric: {} }
      case "VIDEO": return { videoUrl: "" }
      case "DOCUMENT": return { description: "" }
      default: return {}
    }
  }

  async function handleSave() {
    if (!lesson) return
    setIsPending(true)

    const formData = new FormData()
    formData.set("title", title)
    formData.set("durationMins", String(durationMins))
    formData.set("content", JSON.stringify(content))
    if (lesson.type === "CODE") {
      formData.set("codeSkeleton", codeSkeleton)
    }
    if (lesson.type === "DOCUMENT" || lesson.type === "SLIDES") {
      formData.set("fileUrl", doc?.url ?? "")
      formData.set("fileName", doc?.name ?? "")
      formData.set("fileMime", doc?.mime ?? "")
      formData.set("fileSize", doc ? String(doc.size) : "")
    }

    const result = await updateLesson(lesson.id, formData)

    if (result?.error) {
      showToast("Failed to save lesson", "error")
    } else {
      showToast("Lesson saved", "success")
      router.refresh()
      onClose()
    }
    setIsPending(false)
  }

  if (!lesson) return null

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Edit Lesson: ${lesson.type}`}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Common fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                Title
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                Duration (mins)
              </label>
              <Input type="number" value={durationMins} onChange={(e) => setDurationMins(Number(e.target.value))} min={1} max={480} />
            </div>
          </div>

          {/* Type-specific editors */}
          {lesson.type === "SLIDES" && (
            <>
              <SlidesEditor slides={content?.slides ?? []} onChange={(slides) => setContent({ ...content, slides })} />
              <div>
                <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
                  Optional Attachment
                </label>
                <DocumentUpload value={doc} onChange={setDoc} />
              </div>
            </>
          )}
          {lesson.type === "CODE" && (
            <CodeLessonEditor
              brief={content?.brief ?? ""}
              hints={content?.hints ?? []}
              codeSkeleton={codeSkeleton}
              onBriefChange={(brief) => setContent({ ...content, brief })}
              onHintsChange={(hints) => setContent({ ...content, hints })}
              onSkeletonChange={setCodeSkeleton}
            />
          )}
          {lesson.type === "QUIZ" && (
            <QuizEditor questions={content?.questions ?? []} onChange={(questions) => setContent({ ...content, questions })} />
          )}
          {lesson.type === "TASK" && (
            <TaskLessonEditor
              brief={content?.brief ?? ""}
              requirements={content?.requirements ?? []}
              rubric={content?.rubric ?? {}}
              onBriefChange={(brief) => setContent({ ...content, brief })}
              onRequirementsChange={(requirements) => setContent({ ...content, requirements })}
              onRubricChange={(rubric) => setContent({ ...content, rubric })}
            />
          )}
          {lesson.type === "VIDEO" && (
            <VideoEditor videoUrl={content?.videoUrl ?? ""} onChange={(videoUrl) => setContent({ ...content, videoUrl })} />
          )}
          {lesson.type === "DOCUMENT" && (
            <DocumentLessonEditor
              description={content?.description ?? ""}
              doc={doc}
              onDescriptionChange={(description) => setContent({ ...content, description })}
              onDocChange={setDoc}
            />
          )}
        </div>
      </Modal>
      <Toast {...toastProps} />
    </>
  )
}

/* ── DOCUMENT LESSON EDITOR ── */

function DocumentLessonEditor({
  description,
  doc,
  onDescriptionChange,
  onDocChange,
}: {
  description: string
  doc: DocumentMeta | null
  onDescriptionChange: (v: string) => void
  onDocChange: (d: DocumentMeta | null) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          File
        </label>
        <DocumentUpload value={doc} onChange={onDocChange} />
      </div>
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="What this document covers, why it matters, what to focus on…"
          className="w-full min-h-[80px] bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost resize-y focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none"
        />
      </div>
    </div>
  )
}

/* ── SLIDES EDITOR ── */

function SlidesEditor({ slides, onChange }: { slides: { title: string; body: string }[]; onChange: (s: any[]) => void }) {
  function updateSlide(i: number, field: "title" | "body", value: string) {
    const next = [...slides]
    next[i] = { ...next[i], [field]: value }
    onChange(next)
  }

  function addSlide() {
    onChange([...slides, { title: "", body: "" }])
  }

  function removeSlide(i: number) {
    onChange(slides.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-2">
        Slides ({slides.length})
      </label>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {slides.map((slide, i) => (
          <div key={i} className="border border-edge rounded-[var(--radius-md)] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">Slide {i + 1}</span>
              <button onClick={() => removeSlide(i)} className="p-1 text-ink-ghost hover:text-danger transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
            <Input placeholder="Slide title" value={slide.title} onChange={(e) => updateSlide(i, "title", e.target.value)} />
            <textarea
              placeholder="Slide content (markdown)"
              value={slide.body}
              onChange={(e) => updateSlide(i, "body", e.target.value)}
              className="w-full min-h-[80px] bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 font-[family-name:var(--font-family-mono)] text-[12px] text-ink-primary placeholder:text-ink-ghost resize-y focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none"
            />
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addSlide} className="mt-2">
        <Plus size={14} className="mr-1" /> Add Slide
      </Button>
    </div>
  )
}

/* ── CODE LESSON EDITOR ── */

function CodeLessonEditor({
  brief, hints, codeSkeleton, onBriefChange, onHintsChange, onSkeletonChange
}: {
  brief: string; hints: string[]; codeSkeleton: string
  onBriefChange: (v: string) => void; onHintsChange: (v: string[]) => void; onSkeletonChange: (v: string) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Brief / Instructions
        </label>
        <textarea
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          placeholder="Describe what the student should implement..."
          className="w-full min-h-[60px] bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost resize-y focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none"
        />
      </div>
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Code Skeleton
        </label>
        <textarea
          value={codeSkeleton}
          onChange={(e) => onSkeletonChange(e.target.value)}
          placeholder="# Starter code for the student..."
          className="w-full min-h-[120px] bg-[#0D1117] border border-edge rounded-[var(--radius-md)] px-3 py-2 font-[family-name:var(--font-family-mono)] text-[12px] text-[#C9D1D9] placeholder:text-ink-ghost resize-y focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none"
        />
      </div>
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Hints ({hints.length})
        </label>
        {hints.map((hint, i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <Input value={hint} onChange={(e) => { const next = [...hints]; next[i] = e.target.value; onHintsChange(next) }} placeholder={`Hint ${i + 1}`} />
            <button onClick={() => onHintsChange(hints.filter((_, idx) => idx !== i))} className="p-2 text-ink-ghost hover:text-danger transition-colors shrink-0">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onHintsChange([...hints, ""])}>
          <Plus size={14} className="mr-1" /> Add Hint
        </Button>
      </div>
    </div>
  )
}

/* ── QUIZ EDITOR ── */

function QuizEditor({ questions, onChange }: {
  questions: { id: string; question: string; options: string[]; correctIndex: number }[]
  onChange: (q: any[]) => void
}) {
  function updateQuestion(i: number, field: string, value: any) {
    const next = [...questions]
    next[i] = { ...next[i], [field]: value }
    onChange(next)
  }

  function updateOption(qi: number, oi: number, value: string) {
    const next = [...questions]
    const opts = [...next[qi].options]
    opts[oi] = value
    next[qi] = { ...next[qi], options: opts }
    onChange(next)
  }

  function addQuestion() {
    onChange([...questions, {
      id: `q${questions.length + 1}`,
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    }])
  }

  function removeQuestion(i: number) {
    onChange(questions.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-2">
        Questions ({questions.length})
      </label>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {questions.map((q, qi) => (
          <div key={qi} className="border border-edge rounded-[var(--radius-md)] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">Q{qi + 1}</span>
              <button onClick={() => removeQuestion(qi)} className="p-1 text-ink-ghost hover:text-danger transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
            <Input placeholder="Question text" value={q.question} onChange={(e) => updateQuestion(qi, "question", e.target.value)} />
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(qi, "correctIndex", oi)}
                    className="accent-[var(--color-signal)]"
                  />
                  <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} className="flex-1" />
                </div>
              ))}
            </div>
            <p className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-ghost">
              Select the radio button next to the correct answer
            </p>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addQuestion} className="mt-2">
        <Plus size={14} className="mr-1" /> Add Question
      </Button>
    </div>
  )
}

/* ── TASK LESSON EDITOR ── */

function TaskLessonEditor({
  brief, requirements, rubric, onBriefChange, onRequirementsChange, onRubricChange
}: {
  brief: string; requirements: string[]; rubric: Record<string, string>
  onBriefChange: (v: string) => void; onRequirementsChange: (v: string[]) => void; onRubricChange: (v: Record<string, string>) => void
}) {
  const rubricEntries = Object.entries(rubric)

  return (
    <div className="space-y-3">
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Task Brief
        </label>
        <textarea
          value={brief}
          onChange={(e) => onBriefChange(e.target.value)}
          placeholder="Describe the task..."
          className="w-full min-h-[60px] bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost resize-y focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none"
        />
      </div>
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Requirements ({requirements.length})
        </label>
        {requirements.map((req, i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <Input value={req} onChange={(e) => { const next = [...requirements]; next[i] = e.target.value; onRequirementsChange(next) }} placeholder={`Requirement ${i + 1}`} />
            <button onClick={() => onRequirementsChange(requirements.filter((_, idx) => idx !== i))} className="p-2 text-ink-ghost hover:text-danger transition-colors shrink-0">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onRequirementsChange([...requirements, ""])}>
          <Plus size={14} className="mr-1" /> Add Requirement
        </Button>
      </div>
      <div>
        <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
          Rubric ({rubricEntries.length} criteria)
        </label>
        {rubricEntries.map(([category, description], i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <Input value={category} onChange={(e) => {
              const newRubric: Record<string, string> = {}
              rubricEntries.forEach(([k, v], j) => { newRubric[j === i ? e.target.value : k] = v })
              onRubricChange(newRubric)
            }} placeholder="Category (pts)" className="w-1/3" />
            <Input value={description} onChange={(e) => {
              const newRubric = { ...rubric, [category]: e.target.value }
              onRubricChange(newRubric)
            }} placeholder="Criteria description" className="flex-1" />
            <button onClick={() => {
              const newRubric = { ...rubric }
              delete newRubric[category]
              onRubricChange(newRubric)
            }} className="p-2 text-ink-ghost hover:text-danger transition-colors shrink-0">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onRubricChange({ ...rubric, "": "" })}>
          <Plus size={14} className="mr-1" /> Add Criteria
        </Button>
      </div>
    </div>
  )
}

/* ── VIDEO EDITOR ── */

function VideoEditor({ videoUrl, onChange }: { videoUrl: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost mb-1.5">
        Video URL
      </label>
      <Input value={videoUrl} onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/video.mp4" />
      <p className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-ghost mt-1">
        Direct link to an MP4 video file or video hosting URL
      </p>
    </div>
  )
}
