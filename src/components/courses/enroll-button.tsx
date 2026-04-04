"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

interface EnrollButtonProps {
  courseId: string
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { showToast, toastProps } = useToast()

  async function handleEnroll() {
    setIsPending(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        showToast(data.error || "Failed to enroll", "error")
        return
      }

      showToast("Successfully enrolled!", "success")
      router.refresh()
    } catch {
      showToast("Something went wrong", "error")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <Button onClick={handleEnroll} disabled={isPending}>
        {isPending ? "Enrolling…" : "Enroll in Course"}
      </Button>
      <Toast {...toastProps} />
    </>
  )
}
