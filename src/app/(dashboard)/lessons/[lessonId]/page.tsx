import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LevelBadge } from "@/components/ui/badge"
import { Badge } from "@/components/ui/badge"
import { SlideViewer } from "@/components/lessons/slide-viewer"
import { CodeEditor } from "@/components/lessons/code-editor"
import { QuizRenderer } from "@/components/lessons/quiz-renderer"
import { TaskSubmission } from "@/components/lessons/task-submission"

export default async function LessonPage(props: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await props.params

  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, title: true, level: true, instructorId: true },
          },
        },
      },
    },
  })

  if (!lesson) notFound()

  // Positive allow-list: admin, instructor of course, or enrolled student
  const isAdmin = user.role === "ADMIN"
  const isInstructor = lesson.module.course.instructorId === user.id
  let isEnrolled = false
  if (!isAdmin && !isInstructor) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: lesson.module.course.id,
        },
      },
    })
    isEnrolled = enrollment !== null
  }
  if (!isAdmin && !isInstructor && !isEnrolled) {
    notFound()
  }

  // Fetch existing submission for students
  let submission = null
  if (user.role === "STUDENT") {
    submission = await prisma.submission.findUnique({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId: lesson.id,
        },
      },
    })
  }

  const content = (lesson.content as Record<string, unknown>) ?? {}

  const typeBadgeVariant: Record<string, "info" | "purple" | "warning" | "success" | "danger"> = {
    SLIDES: "info",
    CODE: "purple",
    QUIZ: "warning",
    TASK: "success",
    VIDEO: "danger",
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          href={`/courses/${lesson.module.courseId}`}
          className="inline-flex items-center gap-1 text-[13px] text-ink-tertiary hover:text-ink-primary transition-colors"
        >
          <ArrowLeft size={14} />
          {lesson.module.course.title}
        </Link>
        <span className="text-[13px] text-ink-ghost">/</span>
        <span className="text-[13px] text-ink-tertiary">
          {lesson.module.title}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <LevelBadge level={lesson.module.course.level} />
        <Badge variant={typeBadgeVariant[lesson.type] ?? "neutral"}>
          {lesson.type}
        </Badge>
        <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary">
          {lesson.durationMins} min
        </span>
      </div>

      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        {lesson.title}
      </h1>

      {/* Content based on type */}
      {lesson.type === "SLIDES" && (
        <SlideViewer
          slides={
            (content.slides as { title: string; body: string }[]) ?? []
          }
        />
      )}

      {lesson.type === "CODE" && (
        <CodeEditor
          codeSkeleton={lesson.codeSkeleton ?? undefined}
          lessonId={lesson.id}
          existingCode={submission?.codeContent ?? undefined}
          brief={(content.brief as string) ?? undefined}
          hints={(content.hints as string[]) ?? undefined}
        />
      )}

      {lesson.type === "QUIZ" && (
        <QuizRenderer
          questions={
            (content.questions as {
              id: string
              question: string
              options: string[]
              correctIndex: number
            }[]) ?? []
          }
          lessonId={lesson.id}
          existingAnswers={
            (submission?.quizAnswers as Record<string, string>) ?? undefined
          }
        />
      )}

      {lesson.type === "TASK" && (
        <TaskSubmission
          brief={(content.brief as string) ?? ""}
          requirements={(content.requirements as string[]) ?? []}
          rubric={(content.rubric as Record<string, string>) ?? {}}
          lessonId={lesson.id}
          existingSubmission={
            submission
              ? {
                  codeContent: submission.codeContent,
                  videoUrl: submission.videoUrl,
                  status: submission.status,
                }
              : undefined
          }
        />
      )}

      {lesson.type === "VIDEO" && (
        <div className="text-center py-8">
          {content.videoUrl ? (
            <div className="rounded-[var(--radius-lg)] overflow-hidden border border-edge">
              <video
                src={content.videoUrl as string}
                controls
                className="w-full max-h-[600px]"
              />
            </div>
          ) : (
            <p className="text-[14px] text-ink-tertiary">
              No video content available.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
