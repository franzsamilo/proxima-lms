import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseList } from "@/components/courses/course-list"

export default async function CoursesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const courseInclude = {
    instructor: { select: { name: true } },
    modules: {
      select: { id: true, lessons: { select: { id: true } } },
    },
    enrollments: {
      select: { id: true, progress: true, studentId: true },
    },
    _count: { select: { enrollments: true } },
  }

  let courses

  if (user.role === "STUDENT") {
    // Students see courses they're enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: { courseId: true },
    })
    const courseIds = enrollments.map((e) => e.courseId)

    courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      include: courseInclude,
      orderBy: { updatedAt: "desc" },
    })
  } else if (user.role === "TEACHER") {
    // Teachers see their own courses
    courses = await prisma.course.findMany({
      where: { instructorId: user.id },
      include: courseInclude,
      orderBy: { updatedAt: "desc" },
    })
  } else {
    // Admins see all courses
    courses = await prisma.course.findMany({
      include: courseInclude,
      orderBy: { updatedAt: "desc" },
    })
  }

  const canCreate = user.role === "TEACHER" || user.role === "ADMIN"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[24px] font-bold tracking-tight text-ink-primary">
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

      <CourseList courses={courses} currentUserId={user.id} />
    </div>
  )
}
