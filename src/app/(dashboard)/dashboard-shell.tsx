"use client"

import { SessionProvider } from "next-auth/react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useState } from "react"

export interface NotificationItem {
  id: string
  title: string
  subtitle: string
  time: string
  type: "announcement" | "event"
}

interface DashboardShellProps {
  user: { id: string; name: string; email: string; role: string; image?: string | null }
  notifications?: NotificationItem[]
  children: React.ReactNode
}

export function DashboardShell({ user, notifications = [], children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-surface-0">
        <Sidebar user={user} mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar user={user} notifications={notifications} onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-[fadeIn_0.25s_ease]">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
