"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface Tab {
  label: string
  value: string
}

export interface TabsProps {
  tabs: Tab[]
  defaultValue?: string
  onChange?: (value: string) => void
  children: (activeTab: string) => React.ReactNode
  className?: string
}

export function Tabs({ tabs, defaultValue, onChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue ?? tabs[0]?.value ?? "")

  function handleTabClick(value: string) {
    setActiveTab(value)
    onChange?.(value)
  }

  return (
    <div className={className}>
      {/* Tab bar */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              "px-4 py-2 text-[13px] font-medium rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer font-[family-name:var(--font-family-body)]",
              activeTab === tab.value
                ? "bg-signal-muted text-signal"
                : "text-ink-secondary hover:bg-surface-3 hover:text-ink-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {children(activeTab)}
    </div>
  )
}
