import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole !== "TEACHER" && userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { kitId, userId } = body

  if (!kitId || !userId) {
    return NextResponse.json(
      { error: "kitId and userId are required" },
      { status: 400 }
    )
  }

  const kit = await prisma.hardwareKit.findUnique({
    where: { id: kitId },
    include: {
      _count: {
        select: {
          assignments: { where: { returnedAt: null } },
        },
      },
    },
  })

  if (!kit) {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 })
  }

  // Check availability
  if (kit._count.assignments >= kit.totalQty) {
    return NextResponse.json(
      { error: "No available units for this kit" },
      { status: 400 }
    )
  }

  const assignment = await prisma.hardwareAssignment.create({
    data: {
      kitId,
      userId,
    },
  })

  return NextResponse.json(assignment, { status: 201 })
}
