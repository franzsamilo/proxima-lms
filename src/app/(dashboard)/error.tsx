"use client"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="font-[family-name:var(--font-family-display)] text-[20px] font-bold text-ink-primary">
        Something went wrong
      </h2>
      <p className="text-[14px] text-ink-tertiary">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
