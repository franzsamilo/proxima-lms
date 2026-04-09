import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import { createAnnouncementSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

const PAGE_SIZE = 50

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    include: {
      author: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(announcements)
}

export async function POST(request: Request) {
  const user = await requireRole(["TEACHER", "ADMIN"])

  const body = await request.json()
  const parsed = createAnnouncementSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const announcement = await prisma.announcement.create({
    data: {
      ...parsed.data,
      authorId: user.id,
    },
  })

  revalidatePath("/dashboard")
  return NextResponse.json(announcement, { status: 201 })
}
