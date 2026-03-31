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

export function getGradeColor(grade: number): string {
  if (grade >= 90) return "text-emerald-400"
  if (grade >= 80) return "text-blue-400"
  if (grade >= 70) return "text-amber-400"
  return "text-red-400"
}

export function getGradeBgColor(grade: number): string {
  if (grade >= 90) return "bg-emerald-400/10 border-emerald-400/20"
  if (grade >= 80) return "bg-blue-400/10 border-blue-400/20"
  if (grade >= 70) return "bg-amber-400/10 border-amber-400/20"
  return "bg-red-400/10 border-red-400/20"
}

export function getGradeLabel(grade: number): string {
  if (grade >= 90) return "Excellent"
  if (grade >= 80) return "Good"
  if (grade >= 70) return "Satisfactory"
  return "Needs Improvement"
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
