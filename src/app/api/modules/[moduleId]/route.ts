import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateModuleSchema } from "@/lib/validations"

export async function PATCH(
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
  const parsed = updateModuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const updated = await prisma.module.update({
    where: { id: moduleId },
    data: parsed.data,
  })

  revalidatePath(`/courses/${updated.courseId}`)
  return NextResponse.json(updated)
}

export async function DELETE(
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

  await prisma.module.delete({ where: { id: moduleId } })

  return NextResponse.json({ success: true })
}
