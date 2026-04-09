import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const packages = await prisma.lessonPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  })

  return NextResponse.json(packages)
}
