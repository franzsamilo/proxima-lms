import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { CourseList } from "@/components/courses/course-list"
import { ProtocolBadge } from "@/components/ui/protocol-badge"
import type { Prisma, SchoolLevel } from "@prisma/client"

const ALLOWED_LEVELS = ["ELEMENTARY", "HS", "COLLEGE"] as const

export default async function CoursesPage(props: {
  searchParams: Promise<{ level?: string; search?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { level, search } = await props.searchParams
  const normalizedLevel =
    level && (ALLOWED_LEVELS as readonly string[]).includes(level)
      ? (level as SchoolLevel)
      : undefined
  const normalizedSearch = search?.trim() || undefined

  const where: Prisma.CourseWhereInput = {}
  if (normalizedLevel) where.level = normalizedLevel
  if (normalizedSearch) {
    where.OR = [
      { title: { contains: normalizedSearch, mode: "insensitive" } },
      { description: { contains: normalizedSearch, mode: "insensitive" } },
    ]
  }
  if (user.role === "STUDENT") {
    where.enrollments = { some: { studentId: user.id } }
  } else if (user.role === "TEACHER") {
    where.instructorId = user.id
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      instructor: { select: { name: true } },
      modules: { select: { id: true, lessons: { select: { id: true } } } },
      enrollments: { select: { id: true, progress: true, studentId: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const canCreate = user.role === "TEACHER" || user.role === "ADMIN"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-family-display)] text-[28px] md:text-[36px] font-bold tracking-tight text-ink-primary leading-[1.05]">
            Courses
          </h1>
          <p className="mt-2 font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary">
            {courses.length === 0
              ? "No courses yet."
              : `${courses.length} ${courses.length === 1 ? "course" : "courses"} available.`}
          </p>
        </div>
        {canCreate && (
          <Link href="/courses/new">
            <ProtocolButton variant="primary" size="md">
              <Plus size={14} /> New course
            </ProtocolButton>
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-[1fr,180px,auto] gap-2">
        <div className="relative flex items-center bg-surface-2 border border-edge focus-within:border-signal focus-within:shadow-[0_0_0_3px_var(--color-signal-glow)] rounded-[4px] transition-all">
          <Search size={14} className="absolute left-3 text-ink-ghost pointer-events-none" />
          <input
            name="search"
            defaultValue={normalizedSearch ?? ""}
            placeholder="Search courses…"
            className="flex-1 h-10 pl-9 pr-3 bg-transparent font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost outline-none"
          />
        </div>
        <select
          name="level"
          defaultValue={normalizedLevel ?? ""}
          className="h-10 px-3 bg-surface-2 border border-edge rounded-[4px] font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary focus:outline-none focus:border-signal cursor-pointer"
        >
          <option value="">All levels</option>
          <option value="ELEMENTARY">Elementary</option>
          <option value="HS">High school</option>
          <option value="COLLEGE">College</option>
        </select>
        <ProtocolButton type="submit" variant="outline" size="md">
          Filter
        </ProtocolButton>
      </form>

      {/* Active filters */}
      {(normalizedLevel || normalizedSearch) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary">
            Filters:
          </span>
          {normalizedLevel && <ProtocolBadge tone="signal">{normalizedLevel}</ProtocolBadge>}
          {normalizedSearch && <ProtocolBadge tone="signal">&ldquo;{normalizedSearch}&rdquo;</ProtocolBadge>}
          <Link
            href="/courses"
            className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary hover:text-signal transition-colors underline"
          >
            Clear
          </Link>
        </div>
      )}

      <CourseList courses={courses} currentUserId={user.id} />
    </div>
  )
}
