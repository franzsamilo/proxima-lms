"use client"

import { useActionState } from "react"
import { createCourse, updateCourse } from "@/actions/course-actions"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface CreateCourseFormProps {
  course?: {
    id: string
    title: string
    description: string
    level: string
    maxStudents: number
    startDate: string | Date
    endDate: string | Date
  }
}

function formatDateForInput(date: string | Date): string {
  return new Date(date).toISOString().split("T")[0]
}

export function CreateCourseForm({ course }: CreateCourseFormProps) {
  const isEditing = !!course

  async function formAction(_prev: unknown, formData: FormData) {
    if (isEditing && course) {
      return updateCourse(course.id, formData)
    }
    return createCourse(formData)
  }

  const [state, action, isPending] = useActionState(formAction, null)

  const fieldErrors =
    state && typeof state === "object" && "error" in state
      ? (state.error as Record<string, string[]>)
      : null

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
          Course Title
        </label>
        <Input
          name="title"
          placeholder="Introduction to Robotics"
          defaultValue={course?.title}
          required
        />
        {fieldErrors?.title && (
          <p className="text-[12px] text-danger mt-1">{fieldErrors.title[0]}</p>
        )}
      </div>

      <div>
        <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
          Description
        </label>
        <Textarea
          name="description"
          placeholder="Describe the course content and objectives..."
          defaultValue={course?.description}
          required
          rows={4}
        />
        {fieldErrors?.description && (
          <p className="text-[12px] text-danger mt-1">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
            Level
          </label>
          <Select name="level" defaultValue={course?.level ?? ""} required>
            <option value="" disabled>
              Select level
            </option>
            <option value="ELEMENTARY">Elementary</option>
            <option value="HS">High School</option>
            <option value="COLLEGE">College</option>
          </Select>
          {fieldErrors?.level && (
            <p className="text-[12px] text-danger mt-1">
              {fieldErrors.level[0]}
            </p>
          )}
        </div>

        <div>
          <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
            Max Students
          </label>
          <Input
            name="maxStudents"
            type="number"
            placeholder="30"
            defaultValue={course?.maxStudents ?? 30}
            min={1}
            required
          />
          {fieldErrors?.maxStudents && (
            <p className="text-[12px] text-danger mt-1">
              {fieldErrors.maxStudents[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
            Start Date
          </label>
          <Input
            name="startDate"
            type="date"
            defaultValue={
              course?.startDate
                ? formatDateForInput(course.startDate)
                : undefined
            }
            required
          />
          {fieldErrors?.startDate && (
            <p className="text-[12px] text-danger mt-1">
              {fieldErrors.startDate[0]}
            </p>
          )}
        </div>

        <div>
          <label className="block font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-secondary mb-1.5">
            End Date
          </label>
          <Input
            name="endDate"
            type="date"
            defaultValue={
              course?.endDate ? formatDateForInput(course.endDate) : undefined
            }
            required
          />
          {fieldErrors?.endDate && (
            <p className="text-[12px] text-danger mt-1">
              {fieldErrors.endDate[0]}
            </p>
          )}
        </div>
      </div>

      {state &&
        typeof state === "object" &&
        "error" in state &&
        typeof state.error === "string" && (
          <p className="text-[13px] text-danger">{state.error}</p>
        )}

      <Button type="submit" disabled={isPending}>
        {isPending
          ? isEditing
            ? "Updating..."
            : "Creating..."
          : isEditing
            ? "Update Course"
            : "Create Course"}
      </Button>
    </form>
  )
}
