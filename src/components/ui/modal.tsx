"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px] animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-[600px] max-h-[85vh] flex flex-col bg-surface-1 border border-edge rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] animate-[slideUp_200ms_ease-out] overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-edge">
          <h2 className="font-[family-name:var(--font-family-display)] text-[14px] font-bold tracking-[1px] text-ink-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-edge">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
