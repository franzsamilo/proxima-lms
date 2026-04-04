"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, Search, Bell, X, ArrowLeft } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface TopbarProps {
  user: {
    name: string
    image?: string | null
  }
  onMenuClick: () => void
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mobileSearchOpen])

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
      {/* Left: mobile hamburger */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
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

        {/* Notification bell */}
        <button
          className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-danger rounded-full" />
        </button>

        {/* User avatar */}
        <Avatar name={user.name} size={32} className="cursor-pointer" />
      </div>
    </header>
  )
}
