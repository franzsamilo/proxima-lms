# Grades Page Audit

**Scope:** `src/app/(dashboard)/grades/page.tsx`, `src/components/grades/grade-summary-cards.tsx`, `src/components/grades/grade-table.tsx`, `src/components/grades/grade-distribution-chart.tsx`, `src/lib/utils.ts` (grade helpers).

**Coverage:** Page server-fetch, role handling, per-course summaries, grade table, distribution chart (client), grade color thresholds, design-system conformance.

---

## [HIGH] Role handling missing — teachers and admins see empty grades page

**File:** `src/app/(dashboard)/grades/page.tsx:17-46`

Spec says the Grades page should show "student's submissions (or all submissions for teacher's courses, or all for admin)." The implementation hardcodes `studentId: user.id` and `enrollments` query by `studentId: user.id` regardless of role. A logged-in TEACHER or ADMIN will see no course summaries (no enrollments as student) and no graded rows (no submissions as student).

```ts
const gradedSubmissions = await prisma.submission.findMany({
  where: {
    studentId: user.id,
    status: "GRADED",
    grade: { not: null },
  },
  ...
})
```

No branching on `user.role`. Teachers should query submissions where `lesson.module.course.instructorId === user.id`; admins should query all.

---

## [MEDIUM] Summary "totalTasks" counts every lesson, not just graded/gradable ones

**File:** `src/app/(dashboard)/grades/page.tsx:96-99`

`totalTasks` is computed as `course.modules.reduce((acc, m) => acc + m.lessons.length, 0)` — this includes SLIDES lessons (non-gradable per the lesson types CODE/QUIZ/TASK/VIDEO being the submission-producing types, with SLIDES essentially content). The resulting "X/Y tasks" progress on each summary card misrepresents progress (e.g. a student who graded every gradable lesson will never see 100%). Consider filtering by `lesson.type in {CODE, QUIZ, TASK, VIDEO}` or by lessons with any submission activity.

---

## [MEDIUM] Duplicated pass over submissions when building summaries

**File:** `src/app/(dashboard)/grades/page.tsx:80-91`

`courseGradesMap` and `courseCompletedMap` are computed in two separate `for` loops over `gradedSubmissions`. Since every graded submission is "completed", `courseCompletedMap.get(id)` always equals `courseGradesMap.get(id)!.length`. The second loop (and map) is redundant — merge into a single pass or derive `completedTasks` from `grades.length`.

---

## [LOW] `getGradeColor` / `getGradeBgColor` / `getGradeLabel` helpers are unused and off-spec

**File:** `src/lib/utils.ts:21-40`

The spec design system dictates grade colors from semantic tokens (`success`, `info`, `warning`, `danger` with `*-tint` backgrounds). The helpers in `utils.ts` return hardcoded Tailwind palette classes (`text-emerald-400`, `bg-emerald-400/10`, etc.) that don't match the theme tokens. They're also unused on the Grades page — `GradeCircle` in `src/components/ui/grade-circle.tsx` correctly re-implements the thresholds with `success-tint`/`info-tint`/`warning-tint`/`danger-tint`. Either remove the dead helpers or rewrite them to return semantic tokens to prevent future misuse elsewhere.

---

## [LOW] `averageGrade` double-rounded

**File:** `src/app/(dashboard)/grades/page.tsx:101-104` and `src/components/grades/grade-summary-cards.tsx:49`

`averageGrade` is already `Math.round`ed on the server, then re-rounded in the card via `${Math.round(summary.averageGrade)}`. Harmless but indicates two sources of truth for number formatting.

---

## [LOW] `GradeCircle` threshold logic is duplicated from `utils.ts`

**File:** `src/components/ui/grade-circle.tsx:8-13` vs `src/lib/utils.ts:21-33`

`GradeCircle` maintains its own `getGradeStyles` with the 90/80/70 thresholds. If a product decision ever shifts grade bands (e.g., 85 for B), two places must change. Consider a single `getGradeTier(grade): "a"|"b"|"c"|"f"` helper in `utils.ts` consumed by both the circle and the distribution chart.

---

## [LOW] Distribution chart bar uses non-standard Tailwind duration class

**File:** `src/components/grades/grade-distribution-chart.tsx:46`

`duration-600` is not a default Tailwind duration (standard values are 500 and 700). Unless a custom duration is registered in the Tailwind theme, this class is a no-op and the bar will not animate to width. Spec calls for a 600ms ease-out fill transition — use inline `style={{ transition: "width 600ms ease-out" }}` or add `600` to the theme.

---

## [INFO] Spec-conformant items observed

- Page is an async server component, fetches via Prisma, redirects unauth'd users.
- `GradeDistributionChart` is `"use client"` as spec requires.
- `GradeCircle` thresholds match spec (90+ success, 80+ info, 70+ warning, else danger) and use design-system tint/border/text tokens.
- Grade numbers use `var(--font-family-mono)` (JetBrains Mono) per spec typography.
- `GradeTable` provides a mobile card fallback and uses the `DataTable` primitive (row hover handled there).
- Empty states rendered for both no-enrollments and no-graded-submissions.
