import { CourseCard } from "./course-card"

interface CourseListProps {
  courses: Array<{
    id: string
    title: string
    description: string
    level: string
    tier: string
    instructor: { name: string }
    modules: { id: string; lessons: { id: string }[] }[]
    enrollments: { id: string; progress?: number; studentId?: string }[]
    _count?: { enrollments: number }
  }>
  currentUserId?: string
}

export function CourseList({ courses, currentUserId }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary">
          No courses found.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  )
}
