import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { HardwareClient } from "@/components/hardware/hardware-client"

async function loadUser() {
  try {
    return await requireRole(["TEACHER", "ADMIN"])
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized"
    if (message === "Forbidden") redirect("/dashboard")
    redirect("/login")
  }
}

export default async function HardwarePage() {
  const user = await loadUser()

  const kits = await prisma.hardwareKit.findMany({
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: { returnedAt: null },
        select: {
          id: true,
          userId: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  })

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })

  const kitData = kits.map((kit) => ({
    id: kit.id,
    name: kit.name,
    level: kit.level,
    specs: kit.specs,
    totalQty: kit.totalQty,
    imageEmoji: kit.imageEmoji,
    activeAssignments: kit.assignments.length,
    assignments: kit.assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      userName: a.user.name,
    })),
  }))

  return (
    <HardwareClient
      kits={kitData}
      students={students}
      isAdmin={user.role === "ADMIN"}
    />
  )
}
