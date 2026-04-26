"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { SchoolLevel } from "@prisma/client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KitCard } from "@/components/hardware/kit-card"
import { KitFormModal } from "@/components/hardware/kit-form-modal"
import { AssignKitTrigger } from "@/components/hardware/assign-kit-trigger"
import { returnKit } from "@/actions/hardware-actions"

interface Kit {
  id: string
  name: string
  level: SchoolLevel
  specs: string
  totalQty: number
  imageEmoji: string
  activeAssignments: number
  assignments: { id: string; userId: string; userName: string }[]
}

interface Student {
  id: string
  name: string
  email: string
}

interface HardwareClientProps {
  kits: Kit[]
  students: Student[]
  isAdmin: boolean
}

export function HardwareClient({ kits, students, isAdmin }: HardwareClientProps) {
  const [showKitForm, setShowKitForm] = useState(false)
  const router = useRouter()

  const totalDeployed = kits.reduce((s, k) => s + k.activeAssignments, 0)
  const totalCapacity = kits.reduce((s, k) => s + k.totalQty, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-family-display)] text-[28px] md:text-[36px] font-bold tracking-tight text-ink-primary leading-[1.05]">
            Hardware kits
          </h1>
          <p className="mt-2 font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary">
            {kits.length} {kits.length === 1 ? "kit" : "kits"} · {totalDeployed} of {totalCapacity} units assigned
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowKitForm(true)}>
            <Plus size={16} className="mr-1.5" /> New kit
          </Button>
        )}
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
          {kits.map((kit) => (
            <div key={kit.id} className="flex flex-col">
              <KitCard
                kit={{
                  id: kit.id,
                  name: kit.name,
                  emoji: kit.imageEmoji,
                  specs: kit.specs,
                  level: kit.level,
                  totalQty: kit.totalQty,
                  assignedCount: kit.activeAssignments,
                }}
                action={
                  <AssignKitTrigger
                    kit={{ id: kit.id, name: kit.name }}
                    students={students.filter(
                      (s) => !kit.assignments.some((a) => a.userId === s.id)
                    )}
                  />
                }
              />
              {kit.assignments.length > 0 && (
                <div className="mt-2 px-1">
                  {kit.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between py-1.5 text-[12px]"
                    >
                      <span className="font-[family-name:var(--font-family-body)] text-ink-secondary">
                        {assignment.userName}
                      </span>
                      <button
                        onClick={async () => {
                          await returnKit(assignment.id)
                          router.refresh()
                        }}
                        className="font-[family-name:var(--font-family-body)] text-[11px] font-medium text-ink-ghost hover:text-warning transition-colors"
                      >
                        Return
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <KitFormModal
          open={showKitForm}
          onClose={() => setShowKitForm(false)}
        />
      )}
    </div>
  )
}
