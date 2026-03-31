import { Card } from "@/components/ui/card"
import { ProgressBar } from "@/components/ui/progress-bar"

interface Stat {
  label: string
  value: string | number
  subtext?: string
  progress?: number
}

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <p className="font-[family-name:var(--font-family-mono)] text-[10px] font-medium tracking-[2px] uppercase text-ink-ghost mb-2">
            {stat.label}
          </p>
          <p className="font-[family-name:var(--font-family-display)] text-[32px] font-extrabold tracking-tight text-ink-primary">
            {stat.value}
          </p>
          {stat.subtext && (
            <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary mt-1">
              {stat.subtext}
            </p>
          )}
          {stat.progress !== undefined && (
            <div className="mt-2">
              <ProgressBar value={stat.progress} />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
