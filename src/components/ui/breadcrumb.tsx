import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="text-ink-ghost" />}
          {item.href ? (
            <Link
              href={item.href}
              className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary hover:text-ink-secondary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
