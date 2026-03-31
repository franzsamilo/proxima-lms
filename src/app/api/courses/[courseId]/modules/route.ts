import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createModuleSchema } from "@/lib/validations"

export async function POST(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  if (userRole === "TEACHER" && course.instructorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createModuleSchema.safeParse({ ...body, courseId })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // Auto-set order
  const maxOrder = await prisma.module.aggregate({
    where: { courseId },
    _max: { order: true },
  })

  const newOrder = (maxOrder._max.order ?? 0) + 1

  const module = await prisma.module.create({
    data: {
      title: parsed.data.title,
      courseId,
      order: newOrder,
    },
  })

  return NextResponse.json(module, { status: 201 })
}
