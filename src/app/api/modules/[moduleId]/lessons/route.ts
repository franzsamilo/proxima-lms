import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLessonSchema } from "@/lib/validations"

export async function POST(
  request: Request,
  props: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  })

  if (!module) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 })
  }

  if (userRole === "TEACHER" && module.course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createLessonSchema.safeParse({ ...body, moduleId })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Auto-set order
  const maxOrder = await prisma.lesson.aggregate({
    where: { moduleId },
    _max: { order: true },
  })

  const newOrder = (maxOrder._max.order ?? 0) + 1

  const lesson = await prisma.lesson.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      durationMins: parsed.data.durationMins,
      content: parsed.data.content ?? undefined,
      codeSkeleton: parsed.data.codeSkeleton,
      moduleId,
      order: newOrder,
    },
  })

  return NextResponse.json(lesson, { status: 201 })
}
