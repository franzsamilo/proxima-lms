# Mobile Responsiveness & Missing Components — Design Spec

**Date:** 2026-04-04
**Status:** Approved

## Goal

Fill minor component gaps (mobile search, course timeline) and make the entire Proxima LMS app properly responsive for mobile/tablet use. No data loss on small screens, proper touch targets, and correct typography scaling.

## Breakpoints

Per CLAUDE.md and Tailwind defaults:
- `sm` (<640px): phone portrait
- `md` (768px): phone landscape / small tablet
- `lg` (1024px): tablet / desktop — sidebar visibility threshold

## 1. Responsive DataTable with Mobile Card Stack

### Problem
All three tables (task-table, grade-table, user-table) horizontally scroll on mobile, which is poor UX. CLAUDE.md specifies "Mobile: tables become stacked card lists."

### Solution
Extend `DataTable` to accept a `mobileCard` render prop and a `data` array. Below `md`:
- `<table>` gets `hidden md:table`
- A `<div>` card list renders instead using the `mobileCard` function

### DataTable API Change

```tsx
// New props added to DataTable
interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: any[]
  mobileCard?: (item: any, index: number) => React.ReactNode
}
```

When `data` and `mobileCard` are both provided, the component renders:
```tsx
<>
  {/* Mobile cards */}
  <div className="flex flex-col gap-3 md:hidden">
    {data.map((item, i) => mobileCard(item, i))}
  </div>
  {/* Desktop table */}
  <div className="hidden md:block overflow-x-auto">
    <table>...</table>
  </div>
</>
```

When they're not provided, behavior is unchanged (backwards compatible).

### Card Layout Pattern

Each card uses:
- `bg-surface-2 border border-edge rounded-[var(--radius-lg)] p-3.5`
- Top row: primary text (title/name) left, grade circle or status right
- Middle: secondary text (student name, email, course)
- Bottom row: badges (type, status) in a flex-wrap row
- Clickable cards get `cursor-pointer hover:border-edge-strong transition-colors`

### Per-Table Mobile Cards

**TaskTable:**
- Title + optional student name left, grade circle right
- Badges: lesson type + status
- Submitted date as tertiary text

**GradeTable:**
- Lesson title left, grade circle right
- Course name as secondary text
- Badges: lesson type
- Feedback preview truncated to 1 line

**UserTable (custom table → refactor to use DataTable):**
- Avatar + name + email left column
- Badges: role + level
- Tertiary: course count + join date

## 2. Mobile Search in Topbar

### Problem
Search bar is `hidden lg:flex` — completely inaccessible on mobile.

### Solution
Add a Search icon button visible on mobile (`lg:hidden`). On tap, expand search bar to full topbar width with a close button. State managed in Topbar component.

```
[Default mobile topbar]:  [☰]                    [🔍] [🔔] [👤]
[Search expanded]:        [←] [___search input___________] [✕]
```

- Expansion uses `animate-[fadeIn_0.15s_ease]`
- Input auto-focuses on expand
- Escape key or X button collapses back

## 3. Course Timeline Component

### Problem
`course-timeline.tsx` is listed in CLAUDE.md but not implemented.

### Solution
A lightweight visual timeline on the course detail page showing:
- Course start date (dot)
- Each module as a dot with title
- Course end date (dot)

**Desktop:** Horizontal bar with dots and labels above/below alternating.
**Mobile (<md):** Vertical bar with dots and labels to the right.

Placement: Between progress bar and "Modules" section on `courses/[courseId]/page.tsx`.

Props:
```tsx
interface CourseTimelineProps {
  startDate: Date
  endDate: Date
  modules: { title: string; status: string }[]
}
```

Styling:
- Track: `bg-edge` 2px line
- Dots: 10px circles. Published modules = `bg-signal`, Draft = `bg-edge-strong`, start/end = `bg-ink-tertiary`
- Labels: `font-body text-[11px] text-ink-tertiary`, active module = `text-ink-secondary`
- Today marker: `bg-signal` with glow, positioned proportionally along the track

## 4. Touch Target Sizes

### Problem
Buttons and inputs are below the 44px minimum for comfortable touch interaction.

### Files Changed

**`src/components/ui/button.tsx`:**
- Default size: add `min-h-[44px] md:min-h-0`
- Small size: add `min-h-[38px] md:min-h-0`
- Icon size: add `min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0`

**`src/components/ui/input.tsx`:**
- Change `h-10` to `h-11 md:h-10` (44px on mobile, 40px on desktop)

**`src/components/ui/select.tsx`:**
- Same as input: `h-11 md:h-10`

**`src/components/ui/textarea.tsx`:**
- No change needed (already flexible height)

## 5. Typography Scaling

### Problem
Headings and stat values are fixed-size, too large on mobile.

### Changes

**Page titles (h1)** across all page.tsx files:
- `text-[24px]` → `text-[20px] md:text-[24px]`

**Stat card values** in `stats-grid.tsx`:
- `text-[32px]` → `text-[24px] md:text-[32px]`

**Course detail metadata** in `courses/[courseId]/page.tsx`:
- Inline flex of metadata items → add `flex-wrap gap-x-4 gap-y-1`

## 6. Container Width & Spacing

### Problem
Content stretches infinitely on ultra-wide screens. Page padding is fixed.

### Changes

**`src/app/(dashboard)/dashboard-shell.tsx` or layout:**
- Main content area wrapping `{children}`: add `max-w-7xl` (1280px)
- Padding: `p-4 md:p-6`

**Course detail header** (`courses/[courseId]/page.tsx`):
- `flex items-start justify-between` → `flex flex-col md:flex-row md:items-start md:justify-between gap-4`
- Edit button: on mobile, full-width or self-start

**General page headers** (tasks, grades, users, calendar, etc.):
- Any `flex justify-between` header patterns → add `flex-col md:flex-row gap-3` for mobile stacking

## Files Affected Summary

| File | Change |
|------|--------|
| `src/components/ui/data-table.tsx` | Add mobile card rendering |
| `src/components/ui/button.tsx` | Touch target sizes |
| `src/components/ui/input.tsx` | Mobile height |
| `src/components/ui/select.tsx` | Mobile height |
| `src/components/tasks/task-table.tsx` | Add mobileCard renderer |
| `src/components/grades/grade-table.tsx` | Add mobileCard renderer |
| `src/components/users/user-table.tsx` | Refactor to DataTable + mobileCard |
| `src/components/layout/topbar.tsx` | Mobile search expansion |
| `src/components/courses/course-timeline.tsx` | New component |
| `src/app/(dashboard)/courses/[courseId]/page.tsx` | Timeline + responsive header |
| `src/app/(dashboard)/dashboard-shell.tsx` | Max-width + padding |
| `src/app/globals.css` | No changes needed |
| Multiple page.tsx files | h1 typography scaling, header stacking |

## Out of Scope

- Mobile-nav.tsx as separate component (sidebar overlay handles this well already)
- Dark mode toggle (app is dark-only by design)
- Landscape phone optimizations (standard responsive breakpoints cover this)
- `@media (hover: none)` touch-specific CSS (touch targets via min-height is sufficient)
