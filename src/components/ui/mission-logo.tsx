import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MissionLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  href?: string
  showWordmark?: boolean
  showSubtitle?: boolean
  className?: string
}

const sizes = {
  sm: { mark: 28, text: 12, sub: 8, gap: 8 },
  md: { mark: 36, text: 14, sub: 9, gap: 10 },
  lg: { mark: 56, text: 24, sub: 10, gap: 14 },
  xl: { mark: 84, text: 36, sub: 12, gap: 18 },
}

export function MissionLogo({
  size = "md",
  href = "/",
  showWordmark = true,
  showSubtitle = true,
  className,
}: MissionLogoProps) {
  const s = sizes[size]
  const content = (
    <div className={cn("inline-flex items-center", className)} style={{ gap: s.gap }}>
      <LogoMark size={s.mark} />
      {showWordmark && (
        <div className="flex flex-col leading-none" style={{ gap: 3 }}>
          <span
            className="font-[family-name:var(--font-family-display)] font-bold text-ink-primary"
            style={{ fontSize: s.text, letterSpacing: size === "xl" ? "-0.04em" : "0.02em" }}
          >
            <span className="text-signal-gradient">PROXIMA</span>
          </span>
          {showSubtitle && (
            <span
              className="font-[family-name:var(--font-family-mono)] uppercase text-ink-ghost"
              style={{ fontSize: s.sub, letterSpacing: "0.32em" }}
            >
              MISSION DECK
            </span>
          )}
        </div>
      )}
    </div>
  )
  if (href) {
    return <Link href={href} className="inline-block hover:opacity-90 transition-opacity">{content}</Link>
  }
  return content
}

interface LogoMarkProps {
  size?: number
  className?: string
}

export function LogoMark({ size = 36, className }: LogoMarkProps) {
  return (
    <span
      className={cn("relative inline-flex items-center justify-center shrink-0 rounded-[6px]", className)}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--color-signal) 0%, var(--color-signal-deep) 100%)",
        boxShadow: "0 0 24px rgba(34, 211, 183, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
      }}
    >
      {/* orbital rings */}
      <svg
        width={size * 0.74}
        height={size * 0.74}
        viewBox="0 0 32 32"
        className="absolute inset-0 m-auto"
        fill="none"
      >
        <circle cx="16" cy="16" r="14" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
        <ellipse cx="16" cy="16" rx="14" ry="6" stroke="rgba(0,0,0,0.25)" strokeWidth="1" transform="rotate(-30 16 16)" />
        <circle cx="16" cy="16" r="3" fill="rgba(255,255,255,0.95)" />
      </svg>
    </span>
  )
}
