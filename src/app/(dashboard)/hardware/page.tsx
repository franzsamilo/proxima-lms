import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { HardwareClient } from "@/components/hardware/hardware-client"

export default async function HardwarePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role === "STUDENT") redirect("/dashboard")

  const kits = await prisma.hardwareKit.findMany({
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: { returnedAt: null },
        select: { id: true },
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
  }))

  return (
    <HardwareClient
      kits={kitData}
      students={students}
      isAdmin={user.role === "ADMIN"}
    />
  )
}
