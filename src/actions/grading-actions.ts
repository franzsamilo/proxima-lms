"use server"

import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { gradeTaskSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function gradeSubmission(submissionId: string, formData: FormData) {
  await requireRole(["TEACHER", "ADMIN"])

  const existing = await prisma.submission.findUnique({ where: { id: submissionId } })
  if (!existing) return { error: "Submission not found" }

  const parsed = gradeTaskSchema.safeParse({
    grade: Number(formData.get("grade")),
    feedback: formData.get("feedback") ?? undefined,
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback,
      status: "GRADED",
      gradedAt: new Date(),
    },
  })

  revalidatePath("/tasks")
  revalidatePath(`/tasks/${submissionId}`)
  return { success: true }
}
