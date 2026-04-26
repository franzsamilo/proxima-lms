"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { MissionLogo } from "@/components/ui/mission-logo"
import { StatusDot } from "@/components/ui/status-dot"
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
  LogOut,
  ChevronRight,
} from "lucide-react"
import { signOut } from "next-auth/react"

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

interface NavItem {
  name: string
  code: string
  href: string
  icon: typeof LayoutDashboard
  roles: string[] | null
}

interface NavGroup {
  label: string
  channel: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Learn",
    channel: "",
    items: [
      { name: "Dashboard", code: "", href: "/dashboard", icon: LayoutDashboard, roles: null },
      { name: "Courses", code: "", href: "/courses", icon: BookOpen, roles: null },
      { name: "Tasks", code: "", href: "/tasks", icon: CheckSquare, roles: null },
      { name: "Grades", code: "", href: "/grades", icon: BarChart3, roles: null },
      { name: "Calendar", code: "", href: "/calendar", icon: CalendarDays, roles: null },
    ],
  },
  {
    label: "Resources",
    channel: "",
    items: [
      { name: "Lesson Packages", code: "", href: "/packages", icon: Package, roles: null },
      { name: "Hardware Kits", code: "", href: "/hardware", icon: Wrench, roles: ["TEACHER", "ADMIN"] },
    ],
  },
  {
    label: "System",
    channel: "",
    items: [
      { name: "Users", code: "", href: "/users", icon: Users, roles: ["ADMIN"] },
      { name: "Settings", code: "", href: "/settings", icon: Settings, roles: null },
    ],
  },
]

function useClock() {
  const [time, setTime] = useState<string>("--:--:--")
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const h = String(d.getUTCHours()).padStart(2, "0")
      const m = String(d.getUTCMinutes()).padStart(2, "0")
      const s = String(d.getUTCSeconds()).padStart(2, "0")
      setTime(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function Sidebar({ user, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const time = useClock()

  const sidebarContent = (
    <div className="flex flex-col h-full w-[260px] bg-surface-1 border-r border-edge relative overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-30" />

      {/* Logo */}
      <div className="relative shrink-0 px-5 py-5 border-b border-edge">
        <div className="flex items-center justify-between">
          <MissionLogo size="md" />
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 text-ink-secondary hover:text-ink-primary"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[10px] tracking-wide">
          <span className="inline-flex items-center gap-1.5 text-signal">
            <StatusDot status="live" />
            Online
          </span>
          <span className="text-ink-ghost tabular">{time} UTC</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => {
          const visible = group.items.filter(
            (item) => item.roles === null || item.roles.includes(user.role.toUpperCase())
          )
          if (visible.length === 0) return null

          return (
            <div key={group.label} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="font-[family-name:var(--font-family-body)] text-[11px] font-semibold tracking-wide text-ink-ghost uppercase">
                  {group.label}
                </span>
              </div>
              <ul className="flex flex-col gap-0.5">
                {visible.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/")
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "group relative flex items-center gap-3 h-10 pl-3 pr-2 rounded-[6px] font-[family-name:var(--font-family-body)] text-[13px] transition-colors duration-150",
                          isActive
                            ? "bg-signal-muted text-signal"
                            : "text-ink-secondary hover:text-ink-primary hover:bg-surface-2/60"
                        )}
                      >
                        {isActive && (
                          <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-[2px] h-5 tick-vert rounded-r" />
                        )}
                        <Icon size={16} className={cn("shrink-0", isActive && "drop-shadow-[0_0_6px_var(--color-signal)]")} />
                        <span className="flex-1 font-medium">{item.name}</span>
                        {isActive && (
                          <ChevronRight size={12} className="text-signal" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Operator block */}
      <div className="relative shrink-0 border-t border-edge p-3">
        <div className="bracket-frame-4 relative flex items-center gap-3 rounded-[6px] bg-surface-2/60 p-2.5">
          <span className="bracket tl" />
          <span className="bracket tr" />
          <span className="bracket bl" />
          <span className="bracket br" />
          <Avatar name={user.name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="font-[family-name:var(--font-family-display)] text-[13px] font-semibold text-ink-primary truncate leading-tight">
              {user.name}
            </div>
            <div className="font-[family-name:var(--font-family-body)] text-[11px] text-signal/80 mt-0.5 capitalize">
              {user.role.toLowerCase()}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 text-ink-tertiary hover:text-danger hover:bg-danger/10 rounded transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative h-full animate-[slideInLeft_0.2s_ease-out]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
