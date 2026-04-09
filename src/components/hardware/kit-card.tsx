import * as React from "react"
import type { SchoolLevel } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { LevelBadge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"

export interface KitCardData {
  id: string
  name: string
  emoji: string
  specs: string
  level: SchoolLevel
  totalQty: number
  assignedCount: number
}

interface KitCardProps {
  kit: KitCardData
  action?: React.ReactNode
}

export function KitCard({ kit, action }: KitCardProps) {
  const available = Math.max(0, kit.totalQty - kit.assignedCount)
  const assignedRatio =
    kit.totalQty > 0
      ? Math.min(100, Math.max(0, (kit.assignedCount / kit.totalQty) * 100))
      : 0

  return (
    <Card className="flex flex-col gap-4 border border-edge">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none">{kit.emoji}</span>
          <div>
            <h3 className="font-[family-name:var(--font-family-display)] text-[16px] font-bold text-ink-primary leading-tight mb-1">
              {kit.name}
            </h3>
            <LevelBadge level={kit.level} />
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Spec string */}
      <p className="font-[family-name:var(--font-family-mono)] text-[12px] font-normal text-ink-tertiary -mt-1">
        {kit.specs}
      </p>

      {/* Stat boxes */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface-3 rounded-[var(--radius-md)] p-3 text-center">
          <div className="font-[family-name:var(--font-family-mono)] text-[18px] font-bold text-ink-primary">
            {kit.totalQty}
          </div>
          <div className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-wider text-ink-ghost mt-0.5">
            Total
          </div>
        </div>
        <div className="bg-surface-3 rounded-[var(--radius-md)] p-3 text-center">
          <div className="font-[family-name:var(--font-family-mono)] text-[18px] font-bold text-ink-primary">
            {kit.assignedCount}
          </div>
          <div className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-wider text-ink-ghost mt-0.5">
            Assigned
          </div>
        </div>
        <div className="bg-surface-3 rounded-[var(--radius-md)] p-3 text-center">
          <div className="font-[family-name:var(--font-family-mono)] text-[18px] font-bold text-ink-primary">
            {available}
          </div>
          <div className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-wider text-ink-ghost mt-0.5">
            Available
          </div>
        </div>
      </div>

      {/* Assignment progress bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-ink-ghost mb-1.5">
          <span className="font-[family-name:var(--font-family-mono)]">Assignment</span>
          <span className="font-[family-name:var(--font-family-mono)]">
            {Math.round(assignedRatio)}%
          </span>
        </div>
        <ProgressBar value={assignedRatio} />
      </div>
    </Card>
  )
}
