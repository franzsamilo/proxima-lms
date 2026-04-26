import { Suspense } from "react"
import { getSessionUser, getRecentAnnouncements, getUpcomingEvents } from "@/lib/data"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { Panel } from "@/components/ui/panel"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Activity,
  Users,
  CheckCheck,
  Wrench,
  Package,
} from "lucide-react"
import type { ComponentType } from "react"

interface StatRow {
  label: string
  value: string | number
  unit?: string
  caption?: string
  trend?: { direction: "up" | "down" | "flat"; value: string }
  progress?: number
  icon?: React.ReactNode
  channel?: string
}

const Icon = (Comp: ComponentType<{ size?: number }>) => <Comp size={14} />

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const role = user.role
  const firstName = user.name?.split(" ")[0] ?? "there"
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header — renders instantly, no DB roundtrip */}
      <div className="flex flex-col gap-2">
        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
          {today}
        </p>
        <h1 className="font-[family-name:var(--font-family-display)] text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-ink-primary leading-[1.05]">
          Welcome back, {firstName}.
        </h1>
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary max-w-2xl leading-relaxed">
          {role === "STUDENT"
            ? "Here's your courses, pending tasks, recent grades, and what's coming up."
            : role === "TEACHER"
              ? "Monitor your courses, grade pending submissions, and post announcements."
              : "System overview — users, courses, hardware, and packages across the platform."}
        </p>
      </div>

      {/* Stats — streams independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection role={role} userId={user.id} />
      </Suspense>

      {/* Body grid — each panel streams on its own */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Suspense fallback={<PanelSkeleton lines={4} title="Announcements" />}>
            <AnnouncementsSection />
          </Suspense>
          <Suspense fallback={<PanelSkeleton lines={4} title="Recent Activity" />}>
            <RecentActivitySection role={role} userId={user.id} />
          </Suspense>
        </div>
        <Suspense fallback={<PanelSkeleton lines={5} title="Upcoming" />}>
          <UpcomingEventsSection />
        </Suspense>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Streaming sections — each is its own RSC boundary
   ───────────────────────────────────────────────────── */

async function StatsSection({ role, userId }: { role: string; userId: string }) {
  const stats =
    role === "STUDENT"
      ? await getStudentStats(userId)
      : role === "TEACHER"
        ? await getTeacherStats(userId)
        : await getAdminStats()
  return <StatsGrid stats={stats} />
}

async function AnnouncementsSection() {
  const announcements = await getRecentAnnouncements(4)
  return <AnnouncementsPanel announcements={announcements} />
}

async function RecentActivitySection({ role, userId }: { role: string; userId: string }) {
  const submissions = await getRecentSubmissions(userId, role)
  return <RecentActivity submissions={submissions} />
}

async function UpcomingEventsSection() {
  const events = await getUpcomingEvents(5)
  return <UpcomingEvents events={events} />
}

/* ─────────────────────────────────────────────────────
   Skeletons
   ───────────────────────────────────────────────────── */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Panel key={i} variant="default">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-2.5 w-32" />
        </Panel>
      ))}
    </div>
  )
}

function PanelSkeleton({ lines, title }: { lines: number; title: string }) {
  return (
    <Panel variant="default">
      <div className="mb-4">
        <Skeleton className="h-2.5 w-20 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
      {/* Suppress "title" unused warning by anchoring it for screen readers */}
      <span className="sr-only">{title}</span>
    </Panel>
  )
}

/* ─────────────────────────────────────────────────────
   Stat queries
   ───────────────────────────────────────────────────── */

async function getStudentStats(userId: string): Promise<StatRow[]> {
  const [enrollmentCount, pendingCount, gradeResult, progressResult] =
    await Promise.all([
      prisma.enrollment.count({ where: { studentId: userId } }),
      prisma.submission.count({ where: { studentId: userId, status: "SUBMITTED" } }),
      prisma.submission.aggregate({
        where: { studentId: userId, status: "GRADED", grade: { not: null } },
        _avg: { grade: true },
      }),
      prisma.enrollment.aggregate({
        where: { studentId: userId },
        _avg: { progress: true },
      }),
    ])

  const avgGrade = gradeResult._avg.grade ? Math.round(gradeResult._avg.grade) : 0
  const avgProgress = progressResult._avg.progress ? Math.round(progressResult._avg.progress) : 0

  return [
    {
      label: "Enrolled courses",
      value: enrollmentCount,
      caption: enrollmentCount === 1 ? "active course" : "active courses",
      icon: Icon(BookOpen),
    },
    {
      label: "Pending tasks",
      value: pendingCount,
      caption: pendingCount === 0 ? "All caught up" : "Awaiting review",
      icon: Icon(ClipboardList),
    },
    {
      label: "Average grade",
      value: avgGrade ? avgGrade : "—",
      unit: avgGrade ? "/100" : undefined,
      caption: avgGrade ? "Across graded work" : "No grades yet",
      icon: Icon(GraduationCap),
    },
    {
      label: "Overall progress",
      value: `${avgProgress}%`,
      caption: "Across enrolled courses",
      progress: avgProgress,
      icon: Icon(Activity),
    },
  ]
}

async function getTeacherStats(userId: string): Promise<StatRow[]> {
  const courses = await prisma.course.findMany({
    where: { instructorId: userId },
    select: { id: true },
  })
  const courseIds = courses.map((c) => c.id)

  const [pendingReviews, totalStudents, progressResult] = await Promise.all([
    prisma.submission.count({
      where: {
        status: "SUBMITTED",
        lesson: { module: { courseId: { in: courseIds } } },
      },
    }),
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.enrollment.aggregate({
      where: { courseId: { in: courseIds } },
      _avg: { progress: true },
    }),
  ])

  const completionRate = progressResult._avg.progress
    ? Math.round(progressResult._avg.progress)
    : 0

  return [
    {
      label: "Your courses",
      value: courses.length,
      caption: courses.length === 1 ? "Active course" : "Active courses",
      icon: Icon(BookOpen),
    },
    {
      label: "Pending reviews",
      value: pendingReviews,
      caption: pendingReviews > 0 ? "Needs your attention" : "All caught up",
      icon: Icon(CheckCheck),
      trend: pendingReviews > 5 ? { direction: "up", value: "high" } : undefined,
    },
    {
      label: "Students",
      value: totalStudents,
      caption: "Enrolled across courses",
      icon: Icon(Users),
    },
    {
      label: "Avg completion",
      value: `${completionRate}%`,
      caption: "Across all students",
      progress: completionRate,
      icon: Icon(Activity),
    },
  ]
}

async function getAdminStats(): Promise<StatRow[]> {
  const [totalCourses, activeUsers, hardwareKits, packages] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.hardwareKit.count(),
    prisma.lessonPackage.count(),
  ])

  return [
    { label: "Total courses", value: totalCourses, caption: "Across all tiers", icon: Icon(BookOpen) },
    { label: "Total users", value: activeUsers, caption: "Registered users", icon: Icon(Users) },
    { label: "Hardware kits", value: hardwareKits, caption: "In inventory", icon: Icon(Wrench) },
    { label: "Lesson packages", value: packages, caption: "Available packages", icon: Icon(Package) },
  ]
}

async function getRecentSubmissions(userId: string, role: string) {
  if (role === "STUDENT") {
    return prisma.submission.findMany({
      where: { studentId: userId, status: { in: ["SUBMITTED", "GRADED"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true, status: true, grade: true,
        submittedAt: true, gradedAt: true,
        lesson: { select: { title: true, type: true } },
      },
    })
  }
  if (role === "TEACHER") {
    return prisma.submission.findMany({
      where: {
        status: { in: ["SUBMITTED", "GRADED"] },
        lesson: { module: { course: { instructorId: userId } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true, status: true, grade: true,
        submittedAt: true, gradedAt: true,
        lesson: { select: { title: true, type: true } },
      },
    })
  }
  return prisma.submission.findMany({
    where: { status: { in: ["SUBMITTED", "GRADED"] } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true, status: true, grade: true,
      submittedAt: true, gradedAt: true,
      lesson: { select: { title: true, type: true } },
    },
  })
}
