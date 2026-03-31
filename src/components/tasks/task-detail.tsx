import * as React from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { GradeCircle } from "@/components/ui/grade-circle"
import { Badge } from "@/components/ui/badge"
import { CodeViewer } from "./code-viewer"
import { VideoPlayer } from "./video-player"

export interface SubmissionDetail {
  id: string
  status: string
  submittedAt: Date | null
  gradedAt: Date | null
  grade: number | null
  feedback: string | null
  codeContent: string | null
  videoUrl: string | null
  quizAnswers: Record<string, string> | null
  fileUrl: string | null
  lesson: {
    title: string
    type: string
    module: {
      title: string
      course: {
        title: string
      }
    }
  }
  student: {
    name: string
    email: string
  }
}

export interface TaskDetailProps {
  submission: SubmissionDetail
}

export function TaskDetail({ submission }: TaskDetailProps) {
  const { lesson, student } = submission

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-[family-name:var(--font-family-display)] text-[18px] font-bold text-ink-primary">
              {lesson.title}
            </h2>
            <p className="text-[13px] text-ink-tertiary">
              {lesson.module.course.title} &rsaquo; {lesson.module.title}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="neutral">{lesson.type}</Badge>
              <StatusBadge status={submission.status} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[1.5px] text-ink-ghost">
              Student
            </p>
            <p className="text-[13px] font-semibold text-ink-primary">{student.name}</p>
            <p className="text-[12px] text-ink-tertiary">{student.email}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-edge flex flex-wrap gap-6 text-[12px] text-ink-tertiary font-[family-name:var(--font-family-body)]">
          {submission.submittedAt && (
            <span>
              Submitted:{" "}
              <span className="text-ink-secondary font-medium">
                {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          )}
          {submission.gradedAt && (
            <span>
              Graded:{" "}
              <span className="text-ink-secondary font-medium">
                {new Date(submission.gradedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          )}
        </div>
      </Card>

      {/* Submission content */}
      <Card>
        <CardHeader>Submission</CardHeader>

        {lesson.type === "CODE" && submission.codeContent ? (
          <CodeViewer code={submission.codeContent} language="code" />
        ) : lesson.type === "VIDEO" && submission.videoUrl ? (
          <VideoPlayer src={submission.videoUrl} title={lesson.title} />
        ) : lesson.type === "QUIZ" && submission.quizAnswers ? (
          <div className="space-y-3">
            {Object.entries(submission.quizAnswers).map(([question, answer]) => (
              <div key={question} className="space-y-1">
                <p className="font-[family-name:var(--font-family-mono)] text-[11px] uppercase tracking-[1px] text-ink-ghost">
                  {question}
                </p>
                <p className="text-[13px] text-ink-primary bg-surface-3 rounded-[var(--radius-md)] px-3 py-2">
                  {answer}
                </p>
              </div>
            ))}
          </div>
        ) : submission.fileUrl ? (
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal hover:underline text-[13px] font-medium"
          >
            View submitted file
          </a>
        ) : (
          <p className="text-[13px] text-ink-ghost">No submission content available.</p>
        )}
      </Card>

      {/* Grade + feedback */}
      {submission.status === "GRADED" && submission.grade !== null && (
        <Card>
          <CardHeader>Grade &amp; Feedback</CardHeader>
          <div className="flex items-start gap-5">
            <GradeCircle grade={submission.grade} />
            <div className="flex-1 space-y-1">
              <p className="font-[family-name:var(--font-family-mono)] text-[18px] font-bold text-ink-primary">
                {submission.grade}/100
              </p>
              {submission.feedback ? (
                <p className="text-[13px] text-ink-secondary leading-relaxed whitespace-pre-wrap">
                  {submission.feedback}
                </p>
              ) : (
                <p className="text-[13px] text-ink-ghost italic">No feedback provided.</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
