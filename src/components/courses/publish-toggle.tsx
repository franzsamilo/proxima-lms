"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { togglePublishCourse } from "@/actions/course-actions"

interface PublishToggleProps {
  courseId: string
  isPublished: boolean
}

export function PublishToggle({ courseId, isPublished }: PublishToggleProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setIsPending(true)
    await togglePublishCourse(courseId)
    router.refresh()
    setIsPending(false)
  }

  return (
    <Button
      variant={isPublished ? "ghost" : "primary"}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPublished ? (
        <>
          <EyeOff size={14} className="mr-1.5" />
          {isPending ? "Unpublishing…" : "Unpublish"}
        </>
      ) : (
        <>
          <Eye size={14} className="mr-1.5" />
          {isPending ? "Publishing…" : "Publish"}
        </>
      )}
    </Button>
  )
}
