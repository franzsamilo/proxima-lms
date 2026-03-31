import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = session.user.role
  if (userRole !== "TEACHER" && userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const kits = await prisma.hardwareKit.findMany({
    include: {
      _count: {
        select: {
          assignments: { where: { returnedAt: null } },
        },
      },
    },
  })

  return NextResponse.json(kits)
}
