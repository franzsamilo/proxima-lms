import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { LevelTag, ProtocolBadge } from "@/components/ui/protocol-badge"
import { Telemetry } from "@/components/ui/telemetry"
import { ChannelDivider } from "@/components/ui/channel-divider"
import { Panel } from "@/components/ui/panel"
import { SlideViewer } from "@/components/lessons/slide-viewer"
import { CodeEditor } from "@/components/lessons/code-editor"
import { QuizRenderer } from "@/components/lessons/quiz-renderer"
import { TaskSubmission } from "@/components/lessons/task-submission"
import { FileViewer } from "@/components/lessons/file-viewer"

const TYPE_TONE: Record<string, "info" | "purple" | "warning" | "success" | "danger" | "signal"> = {
  SLIDES: "info",
  CODE: "purple",
  QUIZ: "warning",
  TASK: "success",
  VIDEO: "danger",
  DOCUMENT: "signal",
}

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
  const hasFile = Boolean(lesson.fileUrl && lesson.fileName)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-[family-name:var(--font-family-mono)] text-[10px] tracking-[0.16em] uppercase">
        <Link
          href={`/courses/${lesson.module.courseId}`}
          className="inline-flex items-center gap-1.5 text-ink-tertiary hover:text-signal transition-colors"
        >
          <ArrowLeft size={12} />
          {lesson.module.course.title}
        </Link>
        <span className="text-ink-ghost">›</span>
        <span className="text-ink-tertiary">{lesson.module.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <LevelTag level={lesson.module.course.level} />
          <ProtocolBadge tone={TYPE_TONE[lesson.type] ?? "neutral"} dot>
            {lesson.type}
          </ProtocolBadge>
          <span className="inline-flex items-center gap-1 font-[family-name:var(--font-family-mono)] text-[10px] tracking-[0.16em] uppercase text-ink-tertiary tabular">
            <Clock size={10} />
            {lesson.durationMins} MIN
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-family-display)] text-[28px] md:text-[36px] font-bold tracking-tight text-ink-primary leading-[1.05]">
          {lesson.title}
        </h1>

        {lesson.type === "DOCUMENT" && typeof content.description === "string" && content.description && (
          <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-secondary leading-relaxed max-w-3xl">
            {content.description}
          </p>
        )}
      </div>

      <ChannelDivider label={`LESSON ${lesson.type}`} />

      {/* Content based on type */}
      {lesson.type === "SLIDES" && (
        <>
          <SlideViewer
            slides={(content.slides as { title: string; body: string }[]) ?? []}
          />
          {hasFile && (
            <div className="space-y-3">
              <Telemetry className="text-ink-ghost block">ATTACHED RESOURCE</Telemetry>
              <FileViewer
                fileUrl={lesson.fileUrl!}
                fileName={lesson.fileName!}
                fileMime={lesson.fileMime}
                fileSize={lesson.fileSize}
              />
            </div>
          )}
        </>
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
        <Panel variant="default" padding="none" className="overflow-hidden">
          {content.videoUrl ? (
            <video
              src={content.videoUrl as string}
              controls
              className="w-full max-h-[600px] bg-surface-0"
            />
          ) : (
            <div className="text-center py-12">
              <Telemetry className="text-ink-tertiary">NO VIDEO CONTENT AVAILABLE</Telemetry>
            </div>
          )}
        </Panel>
      )}

      {lesson.type === "DOCUMENT" && (
        <>
          {hasFile ? (
            <FileViewer
              fileUrl={lesson.fileUrl!}
              fileName={lesson.fileName!}
              fileMime={lesson.fileMime}
              fileSize={lesson.fileSize}
            />
          ) : (
            <Panel variant="outline" padding="lg">
              <div className="text-center py-12">
                <Telemetry className="text-ink-tertiary">NO DOCUMENT ATTACHED</Telemetry>
                {(isInstructor || isAdmin) && (
                  <p className="mt-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary">
                    Edit this lesson to upload a PDF, DOCX, PPTX, or other file.
                  </p>
                )}
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  )
}
