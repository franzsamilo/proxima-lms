"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { submitTaskSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { updateEnrollmentProgress } from "@/lib/progress"

export async function submitTask(formData: FormData) {
  const user = await requireRole(["STUDENT"])

  const parsed = submitTaskSchema.safeParse({
    lessonId: formData.get("lessonId"),
    codeContent: formData.get("codeContent") ?? undefined,
    videoUrl: formData.get("videoUrl") ?? undefined,
    quizAnswers: formData.get("quizAnswers")
      ? JSON.parse(formData.get("quizAnswers") as string)
      : undefined,
    fileUrl: formData.get("fileUrl") ?? undefined,
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const submission = await prisma.submission.upsert({
    where: {
      studentId_lessonId: {
        studentId: user.id,
        lessonId: parsed.data.lessonId,
      },
    },
    update: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      codeContent: parsed.data.codeContent,
      videoUrl: parsed.data.videoUrl,
      quizAnswers: parsed.data.quizAnswers as Prisma.InputJsonValue | undefined,
      fileUrl: parsed.data.fileUrl,
    },
    create: {
      studentId: user.id,
      lessonId: parsed.data.lessonId,
      status: "SUBMITTED",
      submittedAt: new Date(),
      codeContent: parsed.data.codeContent,
      videoUrl: parsed.data.videoUrl,
      quizAnswers: parsed.data.quizAnswers as Prisma.InputJsonValue | undefined,
      fileUrl: parsed.data.fileUrl,
    },
  })

  // Update enrollment progress
  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    include: { module: true },
  })
  if (lesson) {
    await updateEnrollmentProgress(user.id, lesson.module.courseId)
  }

  revalidatePath("/tasks")
  revalidatePath("/courses")
  return { success: true, submissionId: submission.id }
}
