import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) {
    return NextResponse.json(
      { errors: { email: ["Email already registered"] } },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role as any,
      schoolLevel: parsed.data.schoolLevel as any,
    },
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
