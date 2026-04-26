import { CourseCard } from "./course-card"
import { Panel } from "@/components/ui/panel"
import { Inbox } from "lucide-react"

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
      <Panel variant="outline" padding="lg">
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <Inbox size={32} className="text-ink-ghost" />
          <h3 className="font-[family-name:var(--font-family-display)] text-[16px] font-semibold text-ink-primary">
            No courses found
          </h3>
          <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary max-w-xs">
            Adjust your filters or check back later.
          </p>
        </div>
      </Panel>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
