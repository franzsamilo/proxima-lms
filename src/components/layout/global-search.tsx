"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2, BookOpen, FileText, Package, Users, Wrench, ArrowRight } from "lucide-react"
import { Telemetry } from "@/components/ui/telemetry"
import { ProtocolBadge } from "@/components/ui/protocol-badge"
import { searchAction, type SearchResult } from "@/actions/search-actions"
import { cn } from "@/lib/utils"

const KIND_ICONS: Record<SearchResult["type"], typeof BookOpen> = {
  course: BookOpen,
  lesson: FileText,
  package: Package,
  user: Users,
  kit: Wrench,
}

const KIND_LABELS: Record<SearchResult["type"], string> = {
  course: "COURSE",
  lesson: "LESSON",
  package: "PACKAGE",
  user: "OPERATOR",
  kit: "KIT",
}

interface GlobalSearchProps {
  variant?: "desktop" | "mobile"
  onClose?: () => void
}

export function GlobalSearch({ variant = "desktop", onClose }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(variant === "mobile")
  const [highlightIdx, setHighlightIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await searchAction(q)
        // Only commit if still the latest query
        if (res.query === q.trim()) {
          setResults(res.results)
          setHighlightIdx(0)
        }
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  // Cmd/Ctrl-K to focus
  useEffect(() => {
    if (variant !== "desktop") return
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [variant, open])

  // Click-outside (desktop only)
  useEffect(() => {
    if (variant !== "desktop") return
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClick)
      return () => document.removeEventListener("mousedown", onClick)
    }
  }, [open, variant])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery("")
      setResults([])
      onClose?.()
      router.push(href)
    },
    [router, onClose]
  )

  const grouped = useMemo(() => {
    const buckets: Record<string, SearchResult[]> = {}
    for (const r of results) {
      ;(buckets[r.type] ??= []).push(r)
    }
    return buckets
  }, [results])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (variant === "mobile") {
        onClose?.()
      } else {
        setOpen(false)
        inputRef.current?.blur()
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIdx((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIdx((i) => Math.max(0, i - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const target = results[highlightIdx]
      if (target) navigate(target.href)
    }
  }

  const showDropdown = open && (loading || query.trim().length >= 2)

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        variant === "desktop" && "hidden lg:flex",
        variant === "mobile" && "flex-1"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-3 bg-surface-2/60 border rounded-[4px] transition-all",
          variant === "desktop" && "w-72",
          showDropdown
            ? "border-signal shadow-[0_0_0_2px_var(--color-signal-glow)]"
            : "border-edge"
        )}
      >
        {loading ? (
          <Loader2 size={14} className="text-signal shrink-0 animate-spin" />
        ) : (
          <Search size={14} className="text-ink-ghost shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={variant === "mobile" ? "Search…" : "Query mission deck…"}
          className="flex-1 bg-transparent font-[family-name:var(--font-family-mono)] text-[12px] text-ink-primary placeholder:text-ink-ghost outline-none"
          autoFocus={variant === "mobile"}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setResults([])
              inputRef.current?.focus()
            }}
            className="p-0.5 text-ink-ghost hover:text-ink-secondary transition-colors"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
        {variant === "desktop" && !query && (
          <span className="font-[family-name:var(--font-family-mono)] text-[9px] text-ink-ghost border border-edge px-1 rounded shrink-0">
            ⌘K
          </span>
        )}
      </div>

      {showDropdown && (
        <div
          className={cn(
            "absolute z-50 mt-2 max-h-[420px] overflow-y-auto bg-surface-1 border border-edge rounded-[6px] shadow-[var(--shadow-elevated)] bracket-frame-4 animate-[slideUp_0.15s_ease]",
            variant === "desktop" ? "right-0 w-[420px]" : "inset-x-0"
          )}
        >
          <span className="bracket tl" />
          <span className="bracket tr" />
          <span className="bracket bl" />
          <span className="bracket br" />

          {loading && results.length === 0 && (
            <div className="px-4 py-12 text-center">
              <Telemetry className="text-ink-tertiary">SCANNING…</Telemetry>
            </div>
          )}

          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-12 text-center">
              <Telemetry className="text-ink-tertiary block mb-2">NO MATCHES</Telemetry>
              <p className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-ghost">
                Nothing found for &ldquo;{query.trim()}&rdquo;
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <div className="px-4 py-2.5 border-b border-edge flex items-center justify-between">
                <Telemetry className="text-signal">RESULTS</Telemetry>
                <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost tabular">
                  {String(results.length).padStart(2, "0")} HITS
                </span>
              </div>
              {Object.entries(grouped).map(([kind, items]) => (
                <div key={kind} className="border-b border-edge last:border-b-0">
                  <Telemetry className="text-ink-ghost block px-4 pt-2 pb-1 text-[9px]">
                    {KIND_LABELS[kind as SearchResult["type"]]}
                  </Telemetry>
                  <ul>
                    {items.map((r) => {
                      const idx = results.indexOf(r)
                      const Icon = KIND_ICONS[r.type]
                      const isHighlighted = idx === highlightIdx
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => navigate(r.href)}
                            onMouseEnter={() => setHighlightIdx(idx)}
                            className={cn(
                              "w-full text-left flex items-start gap-3 px-4 py-2.5 transition-colors",
                              isHighlighted ? "bg-surface-3" : "hover:bg-surface-2"
                            )}
                          >
                            <Icon size={14} className="mt-0.5 text-signal/80 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary truncate">
                                {r.title}
                              </div>
                              {r.subtitle && (
                                <div className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-tertiary truncate mt-0.5">
                                  {r.subtitle}
                                </div>
                              )}
                            </div>
                            {r.badge && (
                              <ProtocolBadge tone="neutral" className="shrink-0">
                                {r.badge}
                              </ProtocolBadge>
                            )}
                            {isHighlighted && (
                              <ArrowRight size={12} className="text-signal mt-1 shrink-0" />
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 border-t border-edge flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[9px] uppercase tracking-[0.16em] text-ink-ghost">
            <span>↑ ↓ NAVIGATE</span>
            <span>↵ OPEN</span>
            <span>ESC CLOSE</span>
          </div>
        </div>
      )}
    </div>
  )
}
