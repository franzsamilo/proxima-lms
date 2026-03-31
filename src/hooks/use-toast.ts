"use client"

import { useState, useCallback } from "react"

export interface ToastState {
  message: string
  type: "success" | "error"
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type })
    },
    []
  )

  const hideToast = useCallback(() => {
    setToast(null)
  }, [])

  return {
    toast,
    showToast,
    hideToast,
    toastProps: toast
      ? {
          message: toast.message,
          type: toast.type,
          visible: true,
          onDismiss: hideToast,
        }
      : {
          message: "",
          type: "success" as const,
          visible: false,
          onDismiss: hideToast,
        },
  }
}
