"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  message: string
  type?: "success" | "error"
  visible: boolean
  onDismiss: () => void
}

export function Toast({ message, type = "success", visible, onDismiss }: ToastProps) {
  React.useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      onDismiss()
    }, 3000)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  if (!visible) return null

  const isError = type === "error"
  const Icon = isError ? X : Check

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 bg-surface-1 rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] animate-[slideUp_200ms_ease-out] border-l-[3px]",
        isError ? "border-l-danger" : "border-l-signal"
      )}
    >
      <Icon
        size={14}
        className={cn(
          "shrink-0",
          isError ? "text-danger" : "text-signal"
        )}
      />
      <span className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-primary">
        {message}
      </span>
    </div>
  )
}
