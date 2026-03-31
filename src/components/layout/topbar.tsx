"use client"

import { Menu, Search, Bell } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface TopbarProps {
  user: {
    name: string
    image?: string | null
  }
  onMenuClick: () => void
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-[60px] px-4 lg:px-6 bg-surface-1 border-b border-edge shrink-0">
      {/* Left: mobile hamburger */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Search bar - hidden on mobile */}
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
          className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors"
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
