import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const packages = await prisma.lessonPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  })

  return NextResponse.json(packages)
}
