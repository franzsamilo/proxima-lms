import { TelemetryStat } from "@/components/ui/telemetry-stat"

interface Stat {
  label: string
  value: string | number
  unit?: string
  caption?: string
  trend?: { direction: "up" | "down" | "flat"; value: string }
  progress?: number
  icon?: React.ReactNode
}

interface StatsGridProps {
  stats: Stat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <TelemetryStat
          key={stat.label}
          label={stat.label}
          value={stat.value}
          unit={stat.unit}
          caption={stat.caption}
          trend={stat.trend}
          icon={stat.icon}
          progress={stat.progress !== undefined ? { value: stat.progress } : undefined}
        />
      ))}
    </div>
  )
}
