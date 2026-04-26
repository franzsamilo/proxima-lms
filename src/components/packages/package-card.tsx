import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { Panel } from "@/components/ui/panel"
import { LevelTag, ProtocolBadge } from "@/components/ui/protocol-badge"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { Telemetry } from "@/components/ui/telemetry"
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
    moduleCount: number
    lessonCount: number
  }
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const tierAccent: Record<string, { stripe: string; text: string; tone: "success" | "info" | "purple" }> = {
  ELEMENTARY: { stripe: "from-success/80 to-success/30", text: "text-success", tone: "success" },
  HS: { stripe: "from-info/80 to-info/30", text: "text-info", tone: "info" },
  COLLEGE: { stripe: "from-purple/80 to-purple/30", text: "text-purple", tone: "purple" },
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  const accent = tierAccent[pkg.level] ?? tierAccent.HS
  return (
    <Panel bracket variant="default" className="relative flex flex-col gap-5 hover:bg-surface-3/40 transition-all overflow-hidden">
      {/* Top accent bar */}
      <span className={cn("absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r", accent.stripe)} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <Telemetry className="text-ink-ghost mb-2 block">PAYLOAD · {pkg.tier}</Telemetry>
          <h3 className="font-[family-name:var(--font-family-display)] text-[20px] font-semibold text-ink-primary tracking-tight leading-tight">
            {pkg.name}
          </h3>
        </div>
        <LevelTag level={pkg.level} />
      </div>

      {pkg.description && (
        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary leading-relaxed line-clamp-3">
          {pkg.description}
        </p>
      )}

      {/* Price */}
      <div className="flex items-end gap-1">
        <span className={cn("font-[family-name:var(--font-family-display)] text-[40px] font-bold leading-none tabular tracking-tight", accent.text)}>
          {priceFormatter.format(pkg.price).replace("$", "")}
        </span>
        <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary uppercase tracking-[0.16em] mb-1.5 ml-1.5">
          $ / SEAT
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox label="MODULES" value={pkg.moduleCount} />
        <StatBox label="LESSONS" value={pkg.lessonCount} />
      </div>

      {/* Includes */}
      {pkg.includes.length > 0 && (
        <ul className="space-y-1.5">
          {pkg.includes.map((item, i) => (
            <li key={i} className="flex items-start gap-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
              <Check size={12} className={cn("mt-1 shrink-0", accent.text)} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-3 border-t border-edge flex items-center justify-between gap-2">
        <ProtocolBadge tone="signal" bracket>
          {String(pkg.moduleCount + pkg.lessonCount).padStart(3, "0")} ASSETS
        </ProtocolBadge>
        <Link href={`/courses?level=${pkg.level}`}>
          <ProtocolButton variant="primary" size="sm">
            VIEW COURSES <ArrowRight size={12} />
          </ProtocolButton>
        </Link>
      </div>
    </Panel>
  )
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 px-3 bg-surface-1 border border-edge rounded-[4px]">
      <Telemetry className="text-ink-ghost">{label}</Telemetry>
      <span className="font-[family-name:var(--font-family-display)] text-[22px] font-bold text-ink-primary tabular leading-none">
        {String(value).padStart(2, "0")}
      </span>
    </div>
  )
}
