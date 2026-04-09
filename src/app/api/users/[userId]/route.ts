import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateUserSchema } from "@/lib/validations"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const { userId } = await props.params
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (
    session.user.id === userId &&
    parsed.data.role &&
    parsed.data.role !== "ADMIN"
  ) {
    return NextResponse.json(
      { error: "Admins cannot demote themselves" },
      { status: 400 }
    )
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      schoolLevel: true,
    },
  })

  return NextResponse.json(updated)
}
