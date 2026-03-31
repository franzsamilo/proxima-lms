import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: number
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?"
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, size = 36, className, ...props }, ref) => {
    const initials = getInitials(name)
    const fontSize = Math.max(10, Math.round(size * 0.38))

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-white font-[family-name:var(--font-family-body)] font-semibold shrink-0",
          className
        )}
        style={{
          width: size,
          height: size,
          fontSize,
          background: "linear-gradient(135deg, var(--color-signal), var(--color-purple))",
        }}
        title={name}
        {...props}
      >
        {initials}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
