import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { assignKitSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    await requireRole(["TEACHER", "ADMIN"])
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized"
    const status = message === "Forbidden" ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = assignKitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { kitId, userId } = parsed.data

  const [kit, user] = await Promise.all([
    prisma.hardwareKit.findUnique({ where: { id: kitId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  if (!kit) {
    return NextResponse.json({ error: "Kit not found" }, { status: 404 })
  }
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const activeCount = await prisma.hardwareAssignment.count({
    where: { kitId, returnedAt: null },
  })
  if (activeCount >= kit.totalQty) {
    return NextResponse.json({ error: "Kit fully assigned" }, { status: 409 })
  }

  const existingActive = await prisma.hardwareAssignment.findFirst({
    where: { kitId, userId, returnedAt: null },
  })
  if (existingActive) {
    return NextResponse.json(
      { error: "User already has this kit assigned" },
      { status: 409 }
    )
  }

  const assignment = await prisma.hardwareAssignment.create({
    data: { kitId, userId },
  })

  revalidatePath("/hardware")
  return NextResponse.json(assignment, { status: 201 })
}
