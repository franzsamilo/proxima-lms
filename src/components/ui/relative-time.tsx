"use client"

import { useEffect, useState } from "react"

function formatRelative(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

interface RelativeTimeProps {
  iso: string
}

export function RelativeTime({ iso }: RelativeTimeProps) {
  const [text, setText] = useState<string>("")

  useEffect(() => {
    setText(formatRelative(iso))
    const interval = setInterval(() => setText(formatRelative(iso)), 60000)
    return () => clearInterval(interval)
  }, [iso])

  // Suppress hydration mismatch since server renders empty and client fills in
  return <span suppressHydrationWarning>{text}</span>
}
