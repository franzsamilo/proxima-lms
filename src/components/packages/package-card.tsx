import { Check } from "lucide-react"
import { LevelBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PackageCardProps {
  package: {
    id: string
    name: string
    level: string
    tier: string
    price: number
    description?: string | null
    includes: string[]
    courseCount: number
    lessonCount: number
  }
}

const tierTopBorder: Record<string, string> = {
  ELEMENTARY: "border-t-success",
  HS: "border-t-info",
  COLLEGE: "border-t-purple",
  STARTER: "border-t-success",
  EXPLORER: "border-t-info",
  PROFESSIONAL: "border-t-purple",
}

const tierPriceColor: Record<string, string> = {
  ELEMENTARY: "text-success",
  HS: "text-info",
  COLLEGE: "text-purple",
  STARTER: "text-success",
  EXPLORER: "text-info",
  PROFESSIONAL: "text-purple",
}

const tierCheckColor: Record<string, string> = {
  ELEMENTARY: "text-success",
  HS: "text-info",
  COLLEGE: "text-purple",
  STARTER: "text-success",
  EXPLORER: "text-info",
  PROFESSIONAL: "text-purple",
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  const topBorderClass = tierTopBorder[pkg.level] ?? tierTopBorder[pkg.tier] ?? "border-t-edge"
  const priceColorClass = tierPriceColor[pkg.level] ?? tierPriceColor[pkg.tier] ?? "text-ink-primary"
  const checkColorClass = tierCheckColor[pkg.level] ?? tierCheckColor[pkg.tier] ?? "text-signal"

  return (
    <div
      className={cn(
        "bg-surface-2 border border-edge border-t-[3px] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4",
        "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-elevated)] hover:border-edge-strong",
        topBorderClass
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-family-display)] text-[16px] font-bold text-ink-primary leading-tight">
            {pkg.name}
          </h3>
          <LevelBadge level={pkg.level} />
        </div>

        {pkg.description && (
          <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary leading-relaxed">
            {pkg.description}
          </p>
        )}
      </div>

      {/* Price */}
      <div>
        <span
          className={cn(
            "font-[family-name:var(--font-family-display)] text-[22px] font-extrabold leading-none",
            priceColorClass
          )}
        >
          ₱{pkg.price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary ml-1">
          / package
        </span>
      </div>

      {/* Stats boxes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-3 rounded-[var(--radius-md)] py-3 px-4 flex flex-col items-center justify-center gap-1">
          <span className="font-[family-name:var(--font-family-mono)] text-[20px] font-bold text-ink-primary leading-none">
            {pkg.courseCount}
          </span>
          <span className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[0.5px] text-ink-tertiary">
            Courses
          </span>
        </div>
        <div className="bg-surface-3 rounded-[var(--radius-md)] py-3 px-4 flex flex-col items-center justify-center gap-1">
          <span className="font-[family-name:var(--font-family-mono)] text-[20px] font-bold text-ink-primary leading-none">
            {pkg.lessonCount}
          </span>
          <span className="font-[family-name:var(--font-family-mono)] text-[10px] uppercase tracking-[0.5px] text-ink-tertiary">
            Lessons
          </span>
        </div>
      </div>

      {/* Includes checklist */}
      {pkg.includes.length > 0 && (
        <div className="flex flex-col gap-2">
          {pkg.includes.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Check
                size={14}
                className={cn("mt-[1px] shrink-0", checkColorClass)}
              />
              <span className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Subscribe button */}
      <div className="mt-auto pt-2">
        <Button className="w-full" variant="primary">
          Subscribe
        </Button>
      </div>
    </div>
  )
}
