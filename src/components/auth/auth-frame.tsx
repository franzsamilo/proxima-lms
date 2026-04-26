import * as React from "react"
import { MissionLogo } from "@/components/ui/mission-logo"

interface AuthFrameProps {
  eyebrow: string
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthFrame({ eyebrow, title, subtitle, children }: AuthFrameProps) {
  return (
    <div className="relative w-full">
      {/* Background grid + vignette */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid-fine opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-radial-vignette" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-50" />

      {/* Top header strip */}
      <div className="mb-6 flex items-center justify-center">
        <MissionLogo size="md" href="/" />
      </div>

      {/* Frame card */}
      <div className="relative bracket-frame-4 bg-surface-2/80 backdrop-blur-sm rounded-[6px] border border-edge p-6 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.6)]">
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />

        {/* Header */}
        <div className="mb-6 flex flex-col gap-1.5">
          <span className="font-[family-name:var(--font-family-body)] text-[12px] font-medium text-signal/80">
            {eyebrow}
          </span>
          <h1 className="font-[family-name:var(--font-family-display)] text-[26px] font-bold tracking-tight text-ink-primary leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-tertiary leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-center font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
        Proxima LMS · Robotics &amp; Technical Education
      </div>
    </div>
  )
}
