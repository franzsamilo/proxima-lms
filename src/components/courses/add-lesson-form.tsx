"use client"

import { useActionState } from "react"
import { createLesson } from "@/actions/lesson-actions"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddLessonFormProps {
  moduleId: string
}

export function AddLessonForm({ moduleId }: AddLessonFormProps) {
  async function formAction(_prev: unknown, formData: FormData) {
    return createLesson(formData)
  }

  const [state, action, isPending] = useActionState(formAction, null)

  const fieldErrors =
    state && typeof state === "object" && "error" in state
      ? (state.error as Record<string, string[]>)
      : null

  return (
    <form action={action} className="flex items-end gap-2 mt-2">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="flex-1">
        <Input
          name="title"
          placeholder="Lesson title..."
          required
          className="h-8 text-[12px]"
        />
        {fieldErrors?.title && (
          <p className="text-[12px] text-danger mt-1">{fieldErrors.title[0]}</p>
        )}
      </div>
      <Select
        name="type"
        required
        defaultValue=""
        className="w-28 h-8 text-[12px]"
      >
        <option value="" disabled>
          Type
        </option>
        <option value="SLIDES">Slides</option>
        <option value="CODE">Code</option>
        <option value="QUIZ">Quiz</option>
        <option value="TASK">Task</option>
        <option value="VIDEO">Video</option>
        <option value="DOCUMENT">Document</option>
      </Select>
      <Button type="submit" size="sm" disabled={isPending} className="h-8">
        <Plus size={12} className="mr-1" />
        {isPending ? "..." : "Add"}
      </Button>
    </form>
  )
}
