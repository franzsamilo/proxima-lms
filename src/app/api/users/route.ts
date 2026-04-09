import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { usersQuerySchema } from "@/lib/validations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = usersQuerySchema.safeParse({
    role: searchParams.get("role") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { role, search } = parsed.data
  const where: Record<string, unknown> = {}

  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      schoolLevel: true,
      createdAt: true,
      image: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}
