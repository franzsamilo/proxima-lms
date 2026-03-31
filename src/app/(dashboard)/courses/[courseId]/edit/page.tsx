import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CreateCourseForm } from "@/components/courses/create-course-form"
import { AddModuleForm } from "@/components/courses/add-module-form"
import { AddLessonForm } from "@/components/courses/add-lesson-form"

export default async function EditCoursePage(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "STUDENT") redirect("/courses")

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, type: true, order: true },
          },
        },
      },
    },
  })

  if (!course) notFound()

  if (user.role !== "ADMIN" && course.instructorId !== user.id) {
    redirect("/courses")
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        Edit Course
      </h1>

      <div className="space-y-6 max-w-2xl">
        {/* Course Details */}
        <Card>
          <h2 className="font-[family-name:var(--font-family-display)] text-[13px] font-bold uppercase tracking-[2px] text-ink-tertiary mb-4">
            Course Details
          </h2>
          <CreateCourseForm course={course} />
        </Card>

        {/* Modules */}
        <Card>
          <h2 className="font-[family-name:var(--font-family-display)] text-[13px] font-bold uppercase tracking-[2px] text-ink-tertiary mb-4">
            Modules
          </h2>

          {course.modules.length === 0 ? (
            <p className="text-[13px] text-ink-tertiary mb-4">
              No modules yet. Add a module to get started.
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {course.modules.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-[var(--radius-md)] border border-edge p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-[family-name:var(--font-family-mono)] text-[12px] font-bold text-signal bg-signal-muted w-6 h-6 rounded flex items-center justify-center">
                      {mod.order}
                    </span>
                    <span className="font-[family-name:var(--font-family-body)] text-[14px] font-medium text-ink-primary">
                      {mod.title}
                    </span>
                  </div>

                  {mod.lessons.length > 0 && (
                    <ul className="ml-8 space-y-1 mb-2">
                      {mod.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="text-[13px] text-ink-secondary"
                        >
                          {lesson.order}. {lesson.title}{" "}
                          <span className="text-ink-tertiary">
                            ({lesson.type})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <AddLessonForm moduleId={mod.id} />
                </div>
              ))}
            </div>
          )}

          <AddModuleForm courseId={courseId} />
        </Card>
      </div>
    </div>
  )
}
