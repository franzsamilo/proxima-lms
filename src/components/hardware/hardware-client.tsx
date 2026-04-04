"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KitCard } from "@/components/hardware/kit-card"
import { KitFormModal } from "@/components/hardware/kit-form-modal"
import { AssignKitTrigger } from "@/components/hardware/assign-kit-trigger"

interface Kit {
  id: string
  name: string
  level: string
  specs: string
  totalQty: number
  imageEmoji: string
  activeAssignments: number
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
          Hardware Kits
        </h1>
        {isAdmin && (
          <Button onClick={() => setShowKitForm(true)}>
            <Plus size={16} className="mr-1.5" /> New Kit
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
            <KitCard
              key={kit.id}
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
                  students={students}
                />
              }
            />
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
