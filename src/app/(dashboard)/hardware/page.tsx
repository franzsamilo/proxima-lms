import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { KitCard } from "@/components/hardware/kit-card"
import { AssignKitTrigger } from "@/components/hardware/assign-kit-trigger"

export default async function HardwarePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role === "STUDENT") redirect("/dashboard")

  // Fetch kits with active assignment counts
  const kits = await prisma.hardwareKit.findMany({
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: { returnedAt: null },
        select: { id: true },
      },
    },
  })

  // Fetch students for the assignment modal
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
          Hardware Kits
        </h1>
      </div>

      {kits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🤖</span>
          <p className="font-[family-name:var(--font-family-display)] text-[16px] font-semibold text-ink-primary mb-1">
            No hardware kits yet
          </p>
          <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
            Hardware kits will appear here once added to the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kits.map((kit) => {
            const assignedCount = kit.assignments.length

            return (
              <KitCard
                key={kit.id}
                kit={{
                  id: kit.id,
                  name: kit.name,
                  emoji: kit.imageEmoji,
                  specs: kit.specs,
                  level: kit.level,
                  totalQty: kit.totalQty,
                  assignedCount,
                }}
                action={
                  <AssignKitTrigger
                    kit={{ id: kit.id, name: kit.name }}
                    students={students}
                  />
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
