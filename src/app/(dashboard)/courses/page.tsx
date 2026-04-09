import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseList } from "@/components/courses/course-list"
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

  if (normalizedLevel) {
    where.level = normalizedLevel
  }

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
  // ADMIN: no extra scope

  const courses = await prisma.course.findMany({
    where,
    include: {
      instructor: { select: { name: true } },
      modules: {
        select: { id: true, lessons: { select: { id: true } } },
      },
      enrollments: {
        select: { id: true, progress: true, studentId: true },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const canCreate = user.role === "TEACHER" || user.role === "ADMIN"

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
          Courses
        </h1>
        {canCreate && (
          <Link href="/courses/new">
            <Button>
              <Plus size={16} className="mr-1.5" />
              New Course
            </Button>
          </Link>
        )}
      </div>

      <form
        method="GET"
        className="mb-6 flex flex-col sm:flex-row gap-2"
      >
        <input
          name="search"
          defaultValue={normalizedSearch ?? ""}
          placeholder="Search courses..."
          className="flex-1 bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-ink-primary placeholder:text-ink-ghost focus:outline-none focus:border-edge-strong"
        />
        <select
          name="level"
          defaultValue={normalizedLevel ?? ""}
          className="bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2 text-[13px] text-ink-primary focus:outline-none focus:border-edge-strong"
        >
          <option value="">All levels</option>
          <option value="ELEMENTARY">Elementary</option>
          <option value="HS">High School</option>
          <option value="COLLEGE">College</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>

      <CourseList courses={courses} currentUserId={user.id} />
    </div>
  )
}
