import { prisma } from "@/lib/prisma"

/**
 * Recalculate and update enrollment progress for a student in a course.
 * Progress = (submitted or graded submissions / total lessons) * 100
 */
export async function updateEnrollmentProgress(studentId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: { select: { id: true } },
        },
      },
    },
  })

  if (!course) return

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  )

  if (totalLessons === 0) return

  const lessonIds = course.modules.flatMap((mod) =>
    mod.lessons.map((l) => l.id)
  )

  const completedCount = await prisma.submission.count({
    where: {
      studentId,
      lessonId: { in: lessonIds },
      status: { in: ["SUBMITTED", "GRADED"] },
    },
  })

  const progress = Math.round((completedCount / totalLessons) * 100)

  await prisma.enrollment.updateMany({
    where: { studentId, courseId },
    data: { progress },
  })
}
