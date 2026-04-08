import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  })
}

export type GradeTier = "a" | "b" | "c" | "f"

export function gradeTier(grade: number): GradeTier {
  if (grade >= 90) return "a"
  if (grade >= 80) return "b"
  if (grade >= 70) return "c"
  return "f"
}

export function getLevelColor(level: string): string {
  switch (level) {
    case "ELEMENTARY": return "#10B981"
    case "HS": return "#3B82F6"
    case "COLLEGE": return "#8B5CF6"
    default: return "#64748B"
  }
}

export function getTierFromLevel(level: string): "STARTER" | "EXPLORER" | "PROFESSIONAL" {
  switch (level) {
    case "ELEMENTARY": return "STARTER"
    case "HS": return "EXPLORER"
    case "COLLEGE": return "PROFESSIONAL"
    default: return "STARTER"
  }
}
