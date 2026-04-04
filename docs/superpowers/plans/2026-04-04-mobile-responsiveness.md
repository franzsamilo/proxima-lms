# Mobile Responsiveness & Missing Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Proxima LMS fully responsive on mobile/tablet, fill missing component gaps (mobile search, course timeline), and ensure proper touch targets.

**Architecture:** Extend the shared DataTable component with a `mobileCard` render-prop pattern so all table consumers automatically get card-stack views on small screens. Add responsive classes to UI primitives (Button, Input, Select) for proper touch targets. Add mobile search to Topbar. Create a CourseTimeline component for course detail pages.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS 4, Lucide React icons

---

### Task 1: Touch Target Sizes — Button, Input, Select

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`

- [ ] **Step 1: Update Button touch targets**

In `src/components/ui/button.tsx`, change the `buttonSizes` object to add mobile-friendly min-heights:

```ts
const buttonSizes = {
  default: "px-4 py-2 text-[13px] min-h-[44px] md:min-h-0",
  sm: "px-3 py-1.5 text-[12px] min-h-[38px] md:min-h-0",
  icon: "p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0",
} as const
```

- [ ] **Step 2: Update Input touch target**

In `src/components/ui/input.tsx`, change `h-10` to `h-11 md:h-10` in the className string:

```ts
"flex h-11 md:h-10 w-full bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2.5 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost transition-all duration-200 focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
```

- [ ] **Step 3: Update Select touch target**

In `src/components/ui/select.tsx`, change `h-10` to `h-11 md:h-10` in the className string:

```ts
"flex h-11 md:h-10 w-full bg-surface-3 border border-edge rounded-[var(--radius-md)] px-3 py-2.5 font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary cursor-pointer transition-all duration-200 focus:border-edge-strong focus:ring-[3px] focus:ring-signal-muted focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none",
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/select.tsx
git commit -m "fix: add mobile touch target sizes to Button, Input, Select"
```

---

### Task 2: Typography Scaling & Container Constraints

**Files:**
- Modify: `src/app/(dashboard)/dashboard-shell.tsx`
- Modify: `src/components/dashboard/stats-grid.tsx`
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/courses/page.tsx`
- Modify: `src/app/(dashboard)/courses/[courseId]/page.tsx`
- Modify: `src/app/(dashboard)/courses/new/page.tsx`
- Modify: `src/app/(dashboard)/tasks/page.tsx`
- Modify: `src/app/(dashboard)/grades/page.tsx`
- Modify: `src/app/(dashboard)/hardware/page.tsx`
- Modify: `src/app/(dashboard)/packages/page.tsx`
- Modify: `src/app/(dashboard)/users/page.tsx`
- Modify: `src/app/(dashboard)/lessons/[lessonId]/page.tsx`

- [ ] **Step 1: Add max-width and responsive padding to dashboard shell**

In `src/app/(dashboard)/dashboard-shell.tsx`, change the `<main>` tag:

```tsx
<main className="flex-1 overflow-y-auto p-4 md:p-6 animate-[fadeIn_0.25s_ease]">
  <div className="max-w-7xl mx-auto">
    {children}
  </div>
</main>
```

- [ ] **Step 2: Scale stat card values**

In `src/components/dashboard/stats-grid.tsx`, change the value `<p>` className from `text-[32px]` to responsive:

```tsx
<p className="font-[family-name:var(--font-family-display)] text-[24px] md:text-[32px] font-extrabold tracking-tight text-ink-primary">
  {stat.value}
</p>
```

- [ ] **Step 3: Scale all page h1 headings**

In every page file listed, change `text-[24px]` to `text-[20px] md:text-[24px]` on `<h1>` elements.

Files and exact strings to find/replace (same pattern in all):

Find: `text-[24px] font-bold tracking-tight text-ink-primary`
Replace: `text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary`

Apply in:
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/courses/page.tsx`
- `src/app/(dashboard)/courses/[courseId]/page.tsx`
- `src/app/(dashboard)/courses/new/page.tsx`
- `src/app/(dashboard)/tasks/page.tsx`
- `src/app/(dashboard)/grades/page.tsx`
- `src/app/(dashboard)/hardware/page.tsx`
- `src/app/(dashboard)/packages/page.tsx`
- `src/app/(dashboard)/users/page.tsx`
- `src/app/(dashboard)/lessons/[lessonId]/page.tsx`

- [ ] **Step 4: Make courses page header responsive**

In `src/app/(dashboard)/courses/page.tsx`, change the header div from:

```tsx
<div className="flex items-center justify-between mb-6">
```

to:

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
```

- [ ] **Step 5: Make hardware page header responsive**

In `src/app/(dashboard)/hardware/page.tsx`, change the header div from:

```tsx
<div className="flex items-center justify-between mb-6">
```

to:

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
```

- [ ] **Step 6: Make course detail header responsive**

In `src/app/(dashboard)/courses/[courseId]/page.tsx`, change the header from:

```tsx
<div className="flex items-start justify-between mb-6">
```

to:

```tsx
<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
```

And change the metadata flex from:

```tsx
<div className="flex items-center gap-4 text-[13px] text-ink-tertiary">
```

to:

```tsx
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-tertiary">
```

- [ ] **Step 7: Commit**

```bash
git add src/app/(dashboard)/dashboard-shell.tsx src/components/dashboard/stats-grid.tsx src/app/(dashboard)/dashboard/page.tsx src/app/(dashboard)/courses/page.tsx "src/app/(dashboard)/courses/[courseId]/page.tsx" src/app/(dashboard)/courses/new/page.tsx src/app/(dashboard)/tasks/page.tsx src/app/(dashboard)/grades/page.tsx src/app/(dashboard)/hardware/page.tsx src/app/(dashboard)/packages/page.tsx src/app/(dashboard)/users/page.tsx "src/app/(dashboard)/lessons/[lessonId]/page.tsx"
git commit -m "fix: responsive typography scaling, container max-width, and header stacking"
```

---

### Task 3: Responsive DataTable with Mobile Card Support

**Files:**
- Modify: `src/components/ui/data-table.tsx`

- [ ] **Step 1: Add mobile card rendering to DataTable**

Replace the entire `DataTable` component (not the sub-components) with this version that supports a `mobileCard` render prop:

```tsx
export interface DataTableProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  data?: T[]
  mobileCard?: (item: T, index: number) => React.ReactNode
}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, children, data, mobileCard, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Mobile card list */}
        {data && mobileCard && (
          <div className="flex flex-col gap-3 md:hidden">
            {data.length === 0 ? (
              <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
                No results found.
              </div>
            ) : (
              data.map((item, i) => (
                <div key={i}>{mobileCard(item, i)}</div>
              ))
            )}
          </div>
        )}
        {/* Desktop table */}
        <div className={cn("overflow-x-auto", data && mobileCard ? "hidden md:block" : "")}>
          <table className="w-full border-collapse">{children}</table>
        </div>
      </div>
    )
  }
)
DataTable.displayName = "DataTable"
```

Keep all other sub-components (`DataTableHeader`, `DataTableHead`, `DataTableBody`, `DataTableRow`, `DataTableCell`) unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/data-table.tsx
git commit -m "feat: add mobile card-stack rendering to DataTable component"
```

---

### Task 4: TaskTable Mobile Cards

**Files:**
- Modify: `src/components/tasks/task-table.tsx`

- [ ] **Step 1: Add mobile card renderer to TaskTable**

Replace the entire `TaskTable` component with this version that passes `data` and `mobileCard` to `DataTable`:

```tsx
export function TaskTable({ submissions, showStudent = false }: TaskTableProps) {
  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
        No submissions found.
      </div>
    )
  }

  const renderMobileCard = (row: TaskRow) => (
    <Link
      href={`/tasks/${row.id}`}
      className="block bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5 hover:border-edge-strong transition-colors"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {row.lessonTitle}
          </p>
          {showStudent && row.studentName && (
            <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary mt-0.5">
              {row.studentName}
            </p>
          )}
        </div>
        {row.grade !== null ? (
          <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px] shrink-0" />
        ) : (
          <span className="text-ink-ghost text-[13px] shrink-0">—</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
          {row.lessonType}
        </Badge>
        <StatusBadge status={row.status} />
        {row.submittedAt && (
          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary ml-auto">
            {new Date(row.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  )

  return (
    <DataTable data={submissions} mobileCard={renderMobileCard}>
      <DataTableHeader>
        <tr>
          <DataTableHead>Task</DataTableHead>
          {showStudent && <DataTableHead>Student</DataTableHead>}
          <DataTableHead>Type</DataTableHead>
          <DataTableHead>Status</DataTableHead>
          <DataTableHead>Submitted</DataTableHead>
          <DataTableHead>Grade</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {submissions.map((row) => (
          <DataTableRow key={row.id}>
            <DataTableCell primary>
              <Link
                href={`/tasks/${row.id}`}
                className="hover:text-signal transition-colors duration-150"
              >
                {row.lessonTitle}
              </Link>
            </DataTableCell>
            {showStudent && (
              <DataTableCell>{row.studentName ?? "—"}</DataTableCell>
            )}
            <DataTableCell>
              <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
                {row.lessonType}
              </Badge>
            </DataTableCell>
            <DataTableCell>
              <StatusBadge status={row.status} />
            </DataTableCell>
            <DataTableCell>
              {row.submittedAt
                ? new Date(row.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "���"}
            </DataTableCell>
            <DataTableCell>
              {row.grade !== null ? (
                <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px]" />
              ) : (
                <span className="text-ink-ghost">—</span>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/tasks/task-table.tsx
git commit -m "feat: add mobile card view to TaskTable"
```

---

### Task 5: GradeTable Mobile Cards

**Files:**
- Modify: `src/components/grades/grade-table.tsx`

- [ ] **Step 1: Add mobile card renderer to GradeTable**

Replace the `GradeTable` component with this version:

```tsx
export function GradeTable({ grades }: GradeTableProps) {
  if (grades.length === 0) {
    return (
      <div className="py-12 text-center text-ink-tertiary font-[family-name:var(--font-family-body)] text-[13px]">
        No graded submissions yet.
      </div>
    )
  }

  const renderMobileCard = (row: GradeRow) => (
    <div className="bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5">
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {row.lessonTitle}
          </p>
          <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-secondary mt-0.5">
            {row.courseTitle}
          </p>
        </div>
        <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px] shrink-0" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
          {row.lessonType}
        </Badge>
        {row.submittedAt && (
          <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary">
            {new Date(row.submittedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
      {row.feedback && (
        <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary mt-2 line-clamp-2">
          {row.feedback}
        </p>
      )}
    </div>
  )

  return (
    <DataTable data={grades} mobileCard={renderMobileCard}>
      <DataTableHeader>
        <tr>
          <DataTableHead>Task</DataTableHead>
          <DataTableHead>Course</DataTableHead>
          <DataTableHead>Type</DataTableHead>
          <DataTableHead>Submitted</DataTableHead>
          <DataTableHead>Grade</DataTableHead>
          <DataTableHead>Feedback</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {grades.map((row) => (
          <DataTableRow key={row.id}>
            <DataTableCell primary>{row.lessonTitle}</DataTableCell>
            <DataTableCell>{row.courseTitle}</DataTableCell>
            <DataTableCell>
              <Badge variant={lessonTypeVariantMap[row.lessonType] ?? "neutral"}>
                {row.lessonType}
              </Badge>
            </DataTableCell>
            <DataTableCell>
              {row.submittedAt
                ? new Date(row.submittedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </DataTableCell>
            <DataTableCell>
              <GradeCircle grade={row.grade} className="w-9 h-9 text-[13px]" />
            </DataTableCell>
            <DataTableCell>
              {row.feedback ? (
                <span
                  title={row.feedback}
                  className="block max-w-[200px] truncate text-ink-secondary"
                >
                  {row.feedback}
                </span>
              ) : (
                <span className="text-ink-ghost">—</span>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/grades/grade-table.tsx
git commit -m "feat: add mobile card view to GradeTable"
```

---

### Task 6: UserTable Mobile Cards (Refactor to DataTable)

**Files:**
- Modify: `src/components/users/user-table.tsx`

- [ ] **Step 1: Refactor UserTable to use DataTable with mobile cards**

Replace the entire file with:

```tsx
"use client"

import * as React from "react"
import {
  DataTable,
  DataTableHeader,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/ui/data-table"
import { Avatar } from "@/components/ui/avatar"
import { Badge, LevelBadge } from "@/components/ui/badge"
import type { BadgeVariant } from "@/components/ui/badge"

export interface UserRow {
  id: string
  name: string
  email: string
  role: "STUDENT" | "TEACHER" | "ADMIN"
  schoolLevel: string | null
  department: string | null
  createdAt: Date
  _count: { enrollments: number }
}

const roleVariantMap: Record<string, BadgeVariant> = {
  STUDENT: "info",
  TEACHER: "warning",
  ADMIN: "purple",
}

const roleLabelMap: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin",
}

interface UserTableProps {
  users: UserRow[]
  onEdit: (user: UserRow) => void
}

export function UserTable({ users, onEdit }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
          No users found.
        </p>
      </div>
    )
  }

  const renderMobileCard = (user: UserRow) => (
    <button
      type="button"
      onClick={() => onEdit(user)}
      className="w-full text-left bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5 hover:border-edge-strong transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-2">
        <Avatar name={user.name} size={36} />
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-family-body)] text-[13px] font-semibold text-ink-primary truncate">
            {user.name}
          </p>
          <p className="font-[family-name:var(--font-family-body)] text-[12px] text-ink-tertiary truncate">
            {user.email}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={roleVariantMap[user.role] ?? "neutral"}>
          {roleLabelMap[user.role] ?? user.role}
        </Badge>
        {user.schoolLevel && <LevelBadge level={user.schoolLevel} />}
        <span className="font-[family-name:var(--font-family-body)] text-[11px] text-ink-tertiary ml-auto">
          {user._count.enrollments} {user._count.enrollments === 1 ? "course" : "courses"} · Joined{" "}
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </button>
  )

  return (
    <DataTable data={users} mobileCard={renderMobileCard}>
      <DataTableHeader>
        <tr>
          <DataTableHead>Name</DataTableHead>
          <DataTableHead>Email</DataTableHead>
          <DataTableHead>Role</DataTableHead>
          <DataTableHead>Level</DataTableHead>
          <DataTableHead>Courses</DataTableHead>
          <DataTableHead>Joined</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {users.map((user, idx) => {
          const isLast = idx === users.length - 1
          return (
            <DataTableRow
              key={user.id}
              onClick={() => onEdit(user)}
              className={`cursor-pointer ${isLast ? "[&]:border-b-0" : ""}`}
            >
              <DataTableCell primary>
                <div className="flex items-center gap-2.5">
                  <Avatar name={user.name} size={32} />
                  <span>{user.name}</span>
                </div>
              </DataTableCell>
              <DataTableCell>{user.email}</DataTableCell>
              <DataTableCell>
                <Badge variant={roleVariantMap[user.role] ?? "neutral"}>
                  {roleLabelMap[user.role] ?? user.role}
                </Badge>
              </DataTableCell>
              <DataTableCell>
                {user.schoolLevel ? (
                  <LevelBadge level={user.schoolLevel} />
                ) : (
                  <span className="text-ink-ghost">—</span>
                )}
              </DataTableCell>
              <DataTableCell>{user._count.enrollments}</DataTableCell>
              <DataTableCell>
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </DataTableCell>
            </DataTableRow>
          )
        })}
      </DataTableBody>
    </DataTable>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/users/user-table.tsx
git commit -m "refactor: migrate UserTable to DataTable with mobile card view"
```

---

### Task 7: Mobile Search in Topbar

**Files:**
- Modify: `src/components/layout/topbar.tsx`

- [ ] **Step 1: Add mobile search expansion to Topbar**

Replace the entire `src/components/layout/topbar.tsx` with:

```tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, Search, Bell, X, ArrowLeft } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface TopbarProps {
  user: {
    name: string
    image?: string | null
  }
  onMenuClick: () => void
}

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [mobileSearchOpen])

  // Mobile search expanded state
  if (mobileSearchOpen) {
    return (
      <header className="flex items-center gap-2 h-[60px] px-4 bg-surface-1 border-b border-edge shrink-0 lg:hidden animate-[fadeIn_0.15s_ease]">
        <button
          onClick={() => setMobileSearchOpen(false)}
          className="p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close search"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2 h-10 px-3 bg-surface-2 border border-edge-strong rounded-[var(--radius-md)] shadow-[0_0_0_2px_var(--color-signal-glow)]">
          <Search size={16} className="text-ink-ghost shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileSearchOpen(false)
            }}
          />
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-1 text-ink-ghost hover:text-ink-secondary transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between h-[60px] px-4 lg:px-6 bg-surface-1 border-b border-edge shrink-0">
      {/* Left: mobile hamburger */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Mobile search button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="lg:hidden p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Desktop search bar */}
        <div className="hidden lg:flex items-center gap-2 w-60 h-9 px-3 bg-surface-2 border border-edge rounded-[var(--radius-md)] focus-within:border-edge-strong focus-within:shadow-[0_0_0_2px_var(--color-signal-glow)] transition-all">
          <Search size={16} className="text-ink-ghost shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent font-[family-name:var(--font-family-body)] text-[13px] text-ink-primary placeholder:text-ink-ghost outline-none"
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 text-ink-secondary hover:text-ink-primary hover:bg-surface-3 rounded-[var(--radius-md)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-danger rounded-full" />
        </button>

        {/* User avatar */}
        <Avatar name={user.name} size={32} className="cursor-pointer" />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/topbar.tsx
git commit -m "feat: add expandable mobile search to Topbar"
```

---

### Task 8: Course Timeline Component

**Files:**
- Create: `src/components/courses/course-timeline.tsx`
- Modify: `src/app/(dashboard)/courses/[courseId]/page.tsx`

- [ ] **Step 1: Create the CourseTimeline component**

Create `src/components/courses/course-timeline.tsx`:

```tsx
"use client"

import { cn } from "@/lib/utils"

interface CourseTimelineProps {
  startDate: Date
  endDate: Date
  modules: { title: string; status: string }[]
}

export function CourseTimeline({ startDate, endDate, modules }: CourseTimelineProps) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  const totalDuration = end - start

  const todayPercent = totalDuration > 0
    ? Math.max(0, Math.min(100, ((now - start) / totalDuration) * 100))
    : 0

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const points = [
    { label: "Start", date: startDate, percent: 0, active: true },
    ...modules.map((mod, i) => ({
      label: mod.title,
      date: null,
      percent: ((i + 1) / (modules.length + 1)) * 100,
      active: mod.status === "PUBLISHED",
    })),
    { label: "End", date: endDate, percent: 100, active: false },
  ]

  return (
    <>
      {/* Desktop: horizontal */}
      <div className="hidden md:block relative py-6">
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-edge -translate-y-1/2" />

        {/* Today marker */}
        {todayPercent > 0 && todayPercent < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-signal shadow-[0_0_8px_var(--color-signal-glow)] z-10"
            style={{ left: `${todayPercent}%`, marginLeft: "-6px" }}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-[family-name:var(--font-family-mono)] text-[9px] text-signal whitespace-nowrap">
              TODAY
            </span>
          </div>
        )}

        {/* Points */}
        <div className="relative flex justify-between">
          {points.map((point, i) => (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ width: 0, position: "absolute", left: `${point.percent}%` }}
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 -translate-x-1/2",
                  point.active
                    ? "bg-signal border-signal"
                    : "bg-edge-strong border-edge-strong"
                )}
              />
              <span
                className={cn(
                  "font-[family-name:var(--font-family-body)] text-[11px] mt-2 whitespace-nowrap -translate-x-1/2",
                  i % 2 === 0 ? "mt-2" : "-mt-8",
                  point.active ? "text-ink-secondary" : "text-ink-tertiary"
                )}
              >
                {point.label}
              </span>
              {point.date && (
                <span
                  className={cn(
                    "font-[family-name:var(--font-family-mono)] text-[9px] text-ink-ghost -translate-x-1/2",
                    i % 2 === 0 ? "mt-0.5" : "-mt-3"
                  )}
                >
                  {formatDate(point.date)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden relative pl-6 py-2">
        {/* Vertical track */}
        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-edge" />

        {points.map((point, i) => (
          <div key={i} className="relative flex items-start gap-3 mb-4 last:mb-0">
            <div
              className={cn(
                "absolute left-[-17px] top-1 w-2.5 h-2.5 rounded-full border-2 shrink-0",
                point.active
                  ? "bg-signal border-signal"
                  : "bg-edge-strong border-edge-strong"
              )}
            />
            <div>
              <span
                className={cn(
                  "font-[family-name:var(--font-family-body)] text-[12px]",
                  point.active ? "text-ink-secondary" : "text-ink-tertiary"
                )}
              >
                {point.label}
              </span>
              {point.date && (
                <span className="font-[family-name:var(--font-family-mono)] text-[10px] text-ink-ghost ml-2">
                  {formatDate(point.date)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Add CourseTimeline to course detail page**

In `src/app/(dashboard)/courses/[courseId]/page.tsx`, add the import at the top with the other imports:

```tsx
import { CourseTimeline } from "@/components/courses/course-timeline"
```

Then insert the timeline between the progress bar section and the "Modules" section. Find the closing `</div>` of the progress bar block (after the `{enrollment && ...}` block) and add before the modules `<div>`:

```tsx
      {/* Course Timeline */}
      <div className="mb-6">
        <CourseTimeline
          startDate={course.startDate}
          endDate={course.endDate}
          modules={course.modules.map((m) => ({
            title: m.title,
            status: m.status,
          }))}
        />
      </div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/courses/course-timeline.tsx "src/app/(dashboard)/courses/[courseId]/page.tsx"
git commit -m "feat: add CourseTimeline component with responsive horizontal/vertical layout"
```

---

### Task 9: Line-Clamp Utility in CSS

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add line-clamp utility**

The `line-clamp-2` class used in the GradeTable mobile card needs Tailwind's built-in support. Verify it works by checking that `globals.css` imports tailwindcss (it does: `@import "tailwindcss"`). Tailwind v4 includes `line-clamp-*` utilities by default, so no CSS changes needed.

However, add a mobile-specific `@media (hover: none)` enhancement for interactive elements to `globals.css`, just before the closing of the file:

```css
/* Touch device enhancements */
@media (hover: none) and (pointer: coarse) {
  /* Ensure adequate tap targets on touch devices */
  button, a, [role="button"] {
    min-height: 38px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: add touch device enhancement styles"
```

---

### Task 10: Verify Build

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: No errors. If there are type errors related to the `DataTableProps` generic, fix them by ensuring the generic default `T = any` works with `forwardRef`.

- [ ] **Step 2: Run Next.js build**

```bash
npm run build
```

Expected: Build succeeds. If any page fails, check the error and fix the specific component.

- [ ] **Step 3: Commit any fixes**

If fixes were needed:

```bash
git add -A
git commit -m "fix: resolve build errors from responsive updates"
```
