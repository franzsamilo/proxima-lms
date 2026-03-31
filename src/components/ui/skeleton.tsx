import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-3 rounded-[var(--radius-md)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
