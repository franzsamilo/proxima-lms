"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, Search, Bell, X, ArrowLeft, Megaphone, CalendarDays } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
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
    const absDays = Math.abs(diffDays)
    if (absDays === 0) return "Today"
    if (absDays === 1) return "Yesterday"
    if (absDays < 7) return `${absDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays < 7) return `In ${diffDays}d`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function Topbar({ user, notifications = [], onMenuClick, pageTitle }: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  // Close dropdown on click outside
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

  // Mobile search expanded state
  if (mobileSearchOpen) {
    return (
      <header className="flex items-center gap-2 h-[60px] px-4 bg-surface-1 border-b border-edge shrink-0 lg:hidden animate-[fadeIn_0.15s_ease]">
        <button
          onClick={() => setMobileSearchOpen(false)}
          className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close search"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2 h-10 px-3 bg-surface-2 border border-edge-strong rounded-[var(--radius-md)] shadow-[0_0_0_2px_var(--color-signal-glow)]">
          <Search size={16} className="text-ink-ghost shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileSearchOpen(false)
            }}
          />
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-1 text-ink-ghost hover:text-ink-secondary transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between h-[60px] px-4 lg:px-6 bg-surface-1 border-b border-edge shrink-0">
      {/* Left: mobile hamburger + page title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {pageTitle && (
          <h1 className="font-[family-name:var(--font-family-display)] text-[15px] font-bold tracking-[1px] text-ink-primary truncate">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Mobile search button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Desktop search bar */}
        <div className="hidden lg:flex items-center gap-2 w-60 h-9 px-3 bg-surface-2 border border-edge rounded-[var(--radius-md)] focus-within:border-edge-strong focus-within:shadow-[0_0_0_2px_var(--color-signal-glow)] transition-all">
          <Search size={16} className="text-ink-ghost shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost outline-none"
          />
        </div>

        {/* Notification bell + dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-danger rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface-1 border border-edge rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] z-50 animate-[slideUp_0.15s_ease]">
              <div className="px-4 py-3 border-b border-edge">
                <h3 className="font-[family-name:var(--font-family-display)] text-[13px] font-bold text-ink-primary">
                  Notifications
                </h3>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
                    No new notifications
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif, i) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-3 transition-colors ${
                        i < notifications.length - 1 ? "border-b border-edge" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === "announcement" ? (
                          <Megaphone size={14} className="text-warning" />
                        ) : (
                          <CalendarDays size={14} className="text-info" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-ink-primary truncate">
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
                            {notif.subtitle}
                          </span>
                          <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost">
                            {formatRelativeTime(notif.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <Avatar name={user.name} size={32} className="cursor-pointer" />
      </div>
    </header>
  )
}
