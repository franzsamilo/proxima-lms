import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CreateCourseForm } from "@/components/courses/create-course-form"
import { AddModuleForm } from "@/components/courses/add-module-form"
import { ModulesEditor } from "@/components/courses/modules-editor"

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
            select: { id: true, title: true, type: true, order: true, durationMins: true, content: true, codeSkeleton: true },
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
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-6">
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

          <ModulesEditor modules={JSON.parse(JSON.stringify(course.modules))} />

          <AddModuleForm courseId={courseId} />
        </Card>
      </div>
    </div>
  )
}
