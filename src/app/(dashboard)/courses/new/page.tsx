import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CreateCourseForm } from "@/components/courses/create-course-form"

export default async function NewCoursePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "STUDENT") redirect("/courses")

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        Create Course
      </h1>

      <Card className="max-w-2xl">
        <CreateCourseForm />
      </Card>
    </div>
  )
}
