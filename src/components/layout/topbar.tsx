"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  Menu,
  Search,
  Bell,
  X,
  ArrowLeft,
  Megaphone,
  CalendarDays,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { GlobalSearch } from "@/components/layout/global-search"
import type { NotificationItem } from "@/app/(dashboard)/dashboard-shell"

interface TopbarProps {
  user: {
    name: string
    image?: string | null
  }
  notifications?: NotificationItem[]
  onMenuClick: () => void
  pageTitle?: string
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) {
    const abs = Math.abs(diffDays)
    if (abs === 0) return "Today"
    if (abs === 1) return "Yesterday"
    if (abs < 7) return `${abs}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays < 7) return `In ${diffDays}d`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function useNow() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function Topbar({
  user,
  notifications = [],
  onMenuClick,
  pageTitle,
}: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const now = useNow()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [notifOpen])

  const dateLabel = now
    ? now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "—"

  if (mobileSearchOpen) {
    return (
      <header className="flex items-center gap-2 h-14 px-4 bg-surface-1 border-b border-edge shrink-0 lg:hidden animate-[fadeIn_0.15s_ease]">
        <button
          onClick={() => setMobileSearchOpen(false)}
          className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded transition-colors"
          aria-label="Close search"
        >
          <ArrowLeft size={18} />
        </button>
        <GlobalSearch variant="mobile" onClose={() => setMobileSearchOpen(false)} />
      </header>
    )
  }

  return (
    <header className="relative flex items-center justify-between h-14 px-4 lg:px-6 bg-surface-1 border-b border-edge shrink-0">
      <span className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent" />

      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-3 min-w-0">
          {pageTitle && (
            <h1 className="font-[family-name:var(--font-family-display)] text-[15px] font-semibold tracking-tight text-ink-primary truncate">
              {pageTitle}
            </h1>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Date pill */}
        <div className="hidden md:flex items-center h-8 px-3 bg-surface-2/60 border border-edge rounded-[4px] font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary tabular">
          {dateLabel}
        </div>

        {/* Mobile search trigger */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Desktop search */}
        <GlobalSearch variant="desktop" />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1">
                <span className="block w-2 h-2 bg-plasma rounded-full shadow-[0_0_8px_var(--color-plasma)]" />
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[420px] overflow-y-auto bg-surface-1 border border-edge rounded-[6px] shadow-[var(--shadow-elevated)] z-50 animate-[slideUp_0.15s_ease] bracket-frame-4">
              <span className="bracket tl" />
              <span className="bracket tr" />
              <span className="bracket bl" />
              <span className="bracket br" />
              <div className="px-4 py-3 border-b border-edge flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-family-display)] text-[14px] font-semibold text-ink-primary">
                  Notifications
                </h3>
                <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary tabular">
                  {notifications.length} {notifications.length === 1 ? "item" : "items"}
                </span>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
                    You&rsquo;re all caught up.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-edge">
                  {notifications.map((notif) => (
                    <li key={notif.id}>
                      <Link
                        href={notif.href}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors"
                      >
                        <span className="mt-1 shrink-0">
                          {notif.type === "announcement" ? (
                            <Megaphone size={12} className="text-warning" />
                          ) : (
                            <CalendarDays size={12} className="text-info" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-primary truncate">
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
                              {notif.subtitle}
                            </span>
                            <span className="font-[family-name:var(--font-family-body)] text-[11px] text-signal/80 tabular">
                              {formatRelativeTime(notif.time)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <div className="px-4 py-2 border-t border-edge flex items-center justify-between">
                <Link
                  href="/calendar"
                  onClick={() => setNotifOpen(false)}
                  className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary hover:text-signal transition-colors"
                >
                  View all in calendar →
                </Link>
              </div>
            </div>
          )}
        </div>

        <span className="hidden lg:inline-block w-px h-6 bg-edge" />
        <Avatar name={user.name} size={30} className="cursor-pointer ring-1 ring-edge hover:ring-signal/50 transition-all" />
      </div>
    </header>
  )
}
