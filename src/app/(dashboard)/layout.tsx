import { getSessionUser, getRecentAnnouncements, getUpcomingEvents } from "@/lib/data"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { DashboardShell } from "./dashboard-shell"

const PATH_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/courses": "Courses",
  "/lessons": "Lessons",
  "/tasks": "Tasks",
  "/grades": "Grades",
  "/calendar": "Calendar",
  "/packages": "Lesson Packages",
  "/hardware": "Hardware Kits",
  "/users": "Users",
  "/settings": "Settings",
}

function pathToTitle(pathname: string): string {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname]
  const prefix = Object.keys(PATH_TITLES)
    .filter((p) => pathname === p || pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0]
  return prefix ? PATH_TITLES[prefix] : "Proxima"
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // User + headers must block (we need them to gate render and pick page title).
  // Notifications are non-critical; fetch in parallel but don't let them gate the shell.
  const [user, headerStore, announcements, events] = await Promise.all([
    getSessionUser(),
    headers(),
    getRecentAnnouncements(5).catch(() => []),
    getUpcomingEvents(5).catch(() => []),
  ])
  if (!user) redirect("/login")

  const pathname =
    headerStore.get("x-pathname") ??
    headerStore.get("x-invoke-path") ??
    "/dashboard"
  const pageTitle = pathToTitle(pathname)

  const notifications = [
    ...announcements.map((a) => ({
      id: a.id,
      title: a.title,
      subtitle: a.priority === "HIGH" ? "High priority" : "Announcement",
      time: a.createdAt.toISOString(),
      type: "announcement" as const,
      href: `/dashboard#announcement-${a.id}`,
    })),
    ...events.map((e) => {
      const monthYear = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, "0")}`
      return {
        id: e.id,
        title: e.title,
        subtitle: e.type.charAt(0).toUpperCase() + e.type.slice(1),
        time: e.date.toISOString(),
        type: "event" as const,
        href: `/calendar?month=${monthYear}#event-${e.id}`,
      }
    }),
  ]
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .slice(0, 8)

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
  }

  return (
    <DashboardShell user={safeUser} notifications={notifications} pageTitle={pageTitle}>
      {children}
    </DashboardShell>
  )
}
