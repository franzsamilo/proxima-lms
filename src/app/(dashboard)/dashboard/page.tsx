import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

async function getStudentStats(userId: string) {
  const [enrollmentCount, pendingCount, gradeResult, progressResult] =
    await Promise.all([
      prisma.enrollment.count({ where: { studentId: userId } }),
      prisma.submission.count({
        where: { studentId: userId, status: "SUBMITTED" },
      }),
      prisma.submission.aggregate({
        where: { studentId: userId, status: "GRADED", grade: { not: null } },
        _avg: { grade: true },
      }),
      prisma.enrollment.aggregate({
        where: { studentId: userId },
        _avg: { progress: true },
      }),
    ])

  const avgGrade = gradeResult._avg.grade
    ? Math.round(gradeResult._avg.grade)
    : 0
  const avgProgress = progressResult._avg.progress
    ? Math.round(progressResult._avg.progress)
    : 0

  return [
    { label: "Enrolled Courses", value: enrollmentCount },
    { label: "Pending Tasks", value: pendingCount },
    {
      label: "Average Grade",
      value: avgGrade ? `${avgGrade}%` : "N/A",
      subtext: avgGrade ? "across graded submissions" : "no graded work yet",
    },
    {
      label: "Progress",
      value: `${avgProgress}%`,
      subtext: "overall completion",
      progress: avgProgress,
    },
  ]
}

async function getTeacherStats(userId: string) {
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
    { label: "Active Courses", value: courses.length },
    { label: "Pending Reviews", value: pendingReviews },
    { label: "Total Students", value: totalStudents },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      subtext: "avg student progress",
      progress: completionRate,
    },
  ]
}

async function getAdminStats() {
  const [totalCourses, activeUsers, hardwareKits, packages] =
    await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.hardwareKit.count(),
      prisma.lessonPackage.count(),
    ])

  return [
    { label: "Total Courses", value: totalCourses },
    { label: "Active Users", value: activeUsers },
    { label: "Hardware Kits", value: hardwareKits },
    { label: "Packages", value: packages },
  ]
}

async function getRecentSubmissions(userId: string, role: string) {
  if (role === "STUDENT") {
    return prisma.submission.findMany({
      where: { studentId: userId, status: { in: ["SUBMITTED", "GRADED"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        grade: true,
        submittedAt: true,
        gradedAt: true,
        lesson: { select: { title: true, type: true } },
      },
    })
  }

  if (role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      select: { id: true },
    })
    const courseIds = courses.map((c) => c.id)

    return prisma.submission.findMany({
      where: {
        status: { in: ["SUBMITTED", "GRADED"] },
        lesson: { module: { courseId: { in: courseIds } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        grade: true,
        submittedAt: true,
        gradedAt: true,
        lesson: { select: { title: true, type: true } },
      },
    })
  }

  // ADMIN: all recent
  return prisma.submission.findMany({
    where: { status: { in: ["SUBMITTED", "GRADED"] } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      status: true,
      grade: true,
      submittedAt: true,
      gradedAt: true,
      lesson: { select: { title: true, type: true } },
    },
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const role = user.role

  const [stats, announcements, recentSubmissions, upcomingEvents] =
    await Promise.all([
      role === "STUDENT"
        ? getStudentStats(user.id)
        : role === "TEACHER"
          ? getTeacherStats(user.id)
          : getAdminStats(),
      prisma.announcement.findMany({
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
          createdAt: true,
        },
      }),
      getRecentSubmissions(user.id, role),
      prisma.calendarEvent.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 5,
        select: { id: true, title: true, date: true, type: true },
      }),
    ])

  const firstName = user.name?.split(" ")[0] ?? "there"

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-1">
        Dashboard
      </h1>
      <p className="text-[14px] text-ink-tertiary mb-6">
        Welcome back, {firstName}
      </p>
      <StatsGrid stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 space-y-5">
          <AnnouncementsPanel announcements={announcements} />
          <RecentActivity submissions={recentSubmissions} />
        </div>
        <UpcomingEvents events={upcomingEvents} />
      </div>
    </div>
  )
}
