"use client"

import { useActionState } from "react"
import { createModule } from "@/actions/module-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddModuleFormProps {
  courseId: string
}

export function AddModuleForm({ courseId }: AddModuleFormProps) {
  async function formAction(_prev: unknown, formData: FormData) {
    return createModule(formData)
  }

  const [state, action, isPending] = useActionState(formAction, null)

  const fieldErrors =
    state && typeof state === "object" && "error" in state
      ? (state.error as Record<string, string[]>)
      : null

  return (
    <form action={action} className="flex items-end gap-2">
      <input type="hidden" name="courseId" value={courseId} />
      <div className="flex-1">
        <Input
          name="title"
          placeholder="New module title..."
          required
        />
        {fieldErrors?.title && (
          <p className="text-[12px] text-danger mt-1">{fieldErrors.title[0]}</p>
        )}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        <Plus size={14} className="mr-1" />
        {isPending ? "Adding..." : "Add Module"}
      </Button>
    </form>
  )
}
