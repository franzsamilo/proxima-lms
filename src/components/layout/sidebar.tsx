"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  BarChart3,
  CalendarDays,
  Package,
  Wrench,
  Users,
  Settings,
  X,
} from "lucide-react"

interface SidebarProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    image?: string | null
  }
  mobileOpen: boolean
  onMobileClose: () => void
}

const navGroups = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: null },
      { name: "Courses", href: "/courses", icon: BookOpen, roles: null },
      { name: "Tasks", href: "/tasks", icon: CheckSquare, roles: null },
      { name: "Grades", href: "/grades", icon: BarChart3, roles: null },
      { name: "Calendar", href: "/calendar", icon: CalendarDays, roles: null },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      { name: "Lesson Packages", href: "/packages", icon: Package, roles: null },
      { name: "Hardware Kits", href: "/hardware", icon: Wrench, roles: ["TEACHER", "ADMIN"] as string[] },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { name: "Users", href: "/users", icon: Users, roles: ["ADMIN"] as string[] },
      { name: "Settings", href: "/settings", icon: Settings, roles: null },
    ],
  },
]

export function Sidebar({ user, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 bg-surface-1 shadow-[1px_0_0_var(--color-edge)]">
      {/* Logo block */}
      <div className="flex items-center gap-3 h-[72px] px-5 shrink-0">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--color-signal), #0EA5A0)",
          }}
        >
          <span className="font-[family-name:var(--font-family-display)] text-[16px] font-[800] leading-none">
            P
          </span>
        </div>
        <div className="flex flex-col">
          <span
            className="font-[family-name:var(--font-family-display)] text-[14px] font-[800] tracking-[4px] bg-gradient-to-r from-signal to-[#0EA5A0] bg-clip-text text-transparent leading-tight"
          >
            PROXIMA
          </span>
          <span className="font-[family-name:var(--font-family-mono)] text-[9px] tracking-[3px] text-ink-ghost leading-tight">
            ROBOTICS LMS
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="ml-auto lg:hidden p-1 text-ink-secondary hover:text-ink-primary transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => item.roles === null || item.roles.includes(user.role.toUpperCase())
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="mt-5">
              <span className="block px-3 mb-2 font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[2px] text-ink-ghost">
                {group.label}
              </span>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "relative flex items-center gap-3 h-10 px-3 rounded-[var(--radius-md)] font-[family-name:var(--font-family-body)] text-[13px] font-medium transition-colors duration-200",
                        isActive
                          ? "bg-signal-muted text-signal"
                          : "text-ink-secondary hover:bg-surface-3 hover:text-ink-primary"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-signal rounded-r-full" />
                      )}
                      <Icon size={18} className="shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User block */}
      <div className="shrink-0 h-16 border-t border-edge flex items-center gap-3 px-4">
        <Avatar name={user.name} size={36} />
        <div className="flex flex-col min-w-0">
          <span className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {user.name}
          </span>
          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary capitalize">
            {user.role.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          {/* Slide-in sidebar */}
          <aside className="relative h-full animate-[slideInLeft_0.2s_ease-out]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
