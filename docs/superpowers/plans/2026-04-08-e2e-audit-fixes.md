# E2E Audit Fix-Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all 99 🔴/🟡/🔵 findings from the 2026-04-08 E2E audit on a single feature branch (`fix/e2e-audit-cleanup`) and merge them via one PR.

**Architecture:** Each task bucket maps 1:1 to one audit fragment. The implementer reads the fragment, opens every cited source file at `file:line`, applies the prescribed fix, then runs the per-bucket verification gate (`tsc --noEmit`, `prisma validate`, `npm run build`) before committing. The audit fragment is the spec; this plan is the work breakdown + verification harness.

**Tech Stack:** Next.js 16.2 (App Router, async params), React 19.2, TypeScript 5 (strict), Tailwind CSS 4, Prisma ORM 6 + Supabase PostgreSQL, Auth.js v5 (Credentials + JWT).

**Spec:** `docs/superpowers/specs/2026-04-08-e2e-audit-fixes-design.md`
**Audit report:** `docs/superpowers/audits/2026-04-08-e2e-audit-report.md`
**Audit fragments:** `docs/superpowers/audits/fragments/02-auth.md` … `18-mobile.md`

---

## Conventions for every fix-bucket task

Every task (Tasks 2–17) follows the same shape:

1. **Read the audit fragment** at `docs/superpowers/audits/fragments/NN-<slug>.md`. It contains every finding's `file:line`, "Expected", and "Actual" — those are the exact change instructions.
2. **Open every cited source file** and locate the lines named in the fragment.
3. **Apply each non-NOTE fix** from the fragment. Skip ⚪ NOTE findings.
4. **Run the verification gate** (tsc → prisma validate → next build).
5. **Manual cross-check:** for every finding the bucket claims to close, re-read the fragment's "Expected" line and the new code at `file:line` and confirm they now agree. List the file:line pairs in the commit body.
6. **Commit** with message `fix(<area>): close N findings from fragment NN`.

**Verification gate (run after every bucket):**
```bash
npx tsc --noEmit
npx prisma validate
npm run build
```
All three must succeed before commit. If any fails, fix the regression in the same task — do not advance.

**Never modify files outside the cited list for that bucket.** No "while we're here" cleanup. Adjacent files only get touched if the cited fix forces a downstream signature change.

---

## Task 1: Cut branch + workspace prep

**Files:**
- None modified yet — this is git/workspace setup.

- [ ] **Step 1: Confirm clean working tree against `main`**

```bash
cd "C:/Users/Franz Samilo/Desktop/XTS Projects/proxima-lms"
git status
git log -1 --oneline
```

Expected: clean tree (the only modified file should be `.claude/settings.local.json` if at all). HEAD should be the audit-fixes-spec commit (`docs: add E2E audit fix-pass design spec`).

- [ ] **Step 2: Create the fix branch**

```bash
git checkout -b fix/e2e-audit-cleanup
git status
```

Expected: `On branch fix/e2e-audit-cleanup`, "nothing to commit, working tree clean".

- [ ] **Step 3: Smoke-baseline the verification gate**

Run the verification gate against the unfixed code so we know the starting point:

```bash
npx tsc --noEmit
npx prisma validate
npm run build
```

Expected: all three should succeed (the audit produced no syntactic errors). If `tsc` or `build` fails on `main`, that's a 🔴 BLOCKER discovered during baselining — fix it as part of this task before continuing.

Record the baseline build's output bytes/duration in the commit body so later regressions are visible.

- [ ] **Step 4: No commit on this task** — branch creation is git state, not a code change. Move directly to Task 2.

---

## Task 2: Cross-cutting (fragment 17) — 4 🔵 POLISH

**Source fragment:** `docs/superpowers/audits/fragments/17-cross-cutting.md`

**Findings to close:**
1. `[LOW]` Middleware and root layout reference `icon.svg` while CLAUDE.md spec says `logo.svg`.
2. `[LOW]` Middleware uses `getToken` directly instead of `auth()` wrapper from `@/lib/auth`.
3. `[LOW]` Dead file: `src/hooks/use-current-user.ts`.
4. `[LOW]` Spec component file missing: `src/components/layout/mobile-nav.tsx`.

**Files (read fragment 17 first for exact line numbers):**
- Modify: `src/middleware.ts`
- Modify: `src/app/layout.tsx`
- Modify: `public/icon.svg` → rename to `public/logo.svg` (or add `logo.svg` if asset is missing)
- Delete: `src/hooks/use-current-user.ts`
- Create OR document: `src/components/layout/mobile-nav.tsx` (see Step 5)

- [ ] **Step 1: Read fragment 17 in full**

```
Read docs/superpowers/audits/fragments/17-cross-cutting.md
```

- [ ] **Step 2: Refactor `src/middleware.ts` to use the `auth()` HOF wrapper**

Replace the manual `getToken` middleware with:

```ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith("/login") || path.startsWith("/register")
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/courses") ||
    path.startsWith("/lessons") ||
    path.startsWith("/tasks") ||
    path.startsWith("/grades") ||
    path.startsWith("/calendar") ||
    path.startsWith("/packages") ||
    path.startsWith("/hardware") ||
    path.startsWith("/users") ||
    path.startsWith("/settings")

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
}
```

This single edit closes finding #2 (HOF wrapper) AND finding #4 from fragment 02 (matcher excludes `logo.svg` not `icon.svg`).

- [ ] **Step 3: Update `src/app/layout.tsx` favicon/icon reference**

Locate the line citing `icon.svg` (per fragment 17). Replace with `logo.svg` so the layout reference matches the matcher and the spec.

- [ ] **Step 4: Rename or create the actual asset**

```bash
ls public/
```

If `public/icon.svg` exists and `public/logo.svg` does not: `git mv public/icon.svg public/logo.svg`.
If `public/logo.svg` already exists: delete the stray `public/icon.svg`.
If neither exists: create `public/logo.svg` with the gradient "P" mark per the design system (1-line SVG; reference any existing logo asset under `public/` for shape).

- [ ] **Step 5: Delete the dead `src/hooks/use-current-user.ts`**

```bash
git ls-files src/hooks/use-current-user.ts
grep -r "use-current-user" src/
```

If grep finds zero importers, delete:

```bash
rm src/hooks/use-current-user.ts
```

If grep finds importers, the audit was wrong — leave the file in place and downgrade this finding to ⚪ NOTE in the commit body.

- [ ] **Step 6: Resolve missing `mobile-nav.tsx`**

The audit notes mobile nav logic was folded into `sidebar.tsx`. Confirm by reading `src/components/layout/sidebar.tsx`. If the slide-in/hamburger logic is present there, create a thin re-export shim so the spec'd file path exists:

```ts
// src/components/layout/mobile-nav.tsx
"use client"

// Mobile nav functionality is implemented inside Sidebar; this file exists
// to satisfy the directory structure documented in CLAUDE.md and gives a
// future split a clean import path.
export { Sidebar as MobileNav } from "./sidebar"
```

If the sidebar does NOT contain mobile logic, that's a hidden 🔴 — extract it now into `mobile-nav.tsx`. Document the choice in the commit body.

- [ ] **Step 7: Run verification gate**

```bash
npx tsc --noEmit
npx prisma validate
npm run build
```

Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add src/middleware.ts src/app/layout.tsx public/ src/hooks/ src/components/layout/mobile-nav.tsx
git commit -m "$(cat <<'EOF'
fix(cross-cutting): close 4 findings from fragment 17

- middleware: refactor to auth() HOF; matcher excludes logo.svg
- layout: reference logo.svg
- delete dead src/hooks/use-current-user.ts
- add mobile-nav.tsx shim re-exporting Sidebar

Closes fragment 17 LOW-1, LOW-2, LOW-3, LOW-4.
EOF
)"
```

---

## Task 3: Auth & Session (fragment 02) — 1 🔴 + 3 🟡

**Source fragment:** `docs/superpowers/audits/fragments/02-auth.md`

**Findings to close:**
1. 🔴 BLOCKER — Middleware HOF mismatch (already closed in Task 2; cross-check only).
2. 🟡 BUG — `SchoolLevel` enum mismatch (`HIGH_SCHOOL` vs `HS`).
3. 🟡 BUG — Register API error response key mismatch (`error` vs `errors`).
4. 🟡 BUG — Middleware matcher includes `icon.svg` (already closed in Task 2; cross-check only).

**Files:**
- Modify: `src/app/(auth)/register/page.tsx` (line ~12 per fragment)
- Modify: `src/app/api/auth/register/route.ts` (lines 11, 16 per fragment)
- Read: `src/lib/validations.ts` to confirm `registerSchema` accepts `"HS"` (no edit; this is the source of truth)

- [ ] **Step 1: Read fragment 02 in full**

```
Read docs/superpowers/audits/fragments/02-auth.md
```

- [ ] **Step 2: Confirm Task 2 closed the middleware findings**

Re-read `src/middleware.ts` and confirm:
- It exports `auth((req) => ...)` from `@/lib/auth`
- The matcher string is `"/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"`

If either is missing, return to Task 2.

- [ ] **Step 3: Fix `SchoolLevel` enum drift in register page**

Open `src/app/(auth)/register/page.tsx`, locate the `SchoolLevel` type alias and the `<select>` options for school level. Replace every literal `"HIGH_SCHOOL"` with `"HS"`:

```tsx
type SchoolLevel = "ELEMENTARY" | "HS" | "COLLEGE"

// Inside the school level <select>:
<option value="ELEMENTARY">Elementary</option>
<option value="HS">High School</option>
<option value="COLLEGE">College</option>
```

The display label can stay "High School" — only the value changes.

- [ ] **Step 4: Fix register API error key**

Open `src/app/api/auth/register/route.ts`. The fragment says lines 11 and 16 return `{ error: ... }` but the client (`register/page.tsx:66-69`) reads `data.errors`. Pick the client side as the source of truth (it's more idiomatic for fieldErrors). Change the API:

```ts
if (!parsed.success) {
  return NextResponse.json(
    { errors: parsed.error.flatten().fieldErrors },
    { status: 400 }
  )
}

const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
if (exists) {
  return NextResponse.json(
    { errors: { email: ["Email already registered"] } },
    { status: 409 }
  )
}
```

This makes both error shapes uniform under `data.errors` so the existing client error handler works for both validation errors and duplicate-email conflicts.

- [ ] **Step 5: Verify the client error handler still parses both shapes**

Re-read `src/app/(auth)/register/page.tsx` lines ~60-80. Confirm it reads `data.errors` and surfaces a per-field error or top-level message. If the handler only renders generic text, leave that as a separate ⚪ NOTE — fix is out of scope for this finding.

- [ ] **Step 6: Run verification gate**

```bash
npx tsc --noEmit
npm run build
```

(`prisma validate` is a no-op for this bucket.)

- [ ] **Step 7: Commit**

```bash
git add src/app/(auth)/register/page.tsx src/app/api/auth/register/route.ts
git commit -m "$(cat <<'EOF'
fix(auth): close 4 findings from fragment 02

- register page: use HS instead of HIGH_SCHOOL to match registerSchema
- register API: return { errors: ... } shape for both validation and 409
- middleware HOF + logo.svg matcher closed in Task 2 (cross-checked)

Closes fragment 02 BLOCKER-1, BUG-2, BUG-3, BUG-4.
EOF
)"
```

---

## Task 4: Dashboard (fragment 03) — 2 🔴

**Source fragment:** `docs/superpowers/audits/fragments/03-dashboard.md`

**Findings to close:**
1. 🔴 BLOCKER — Topbar missing page-title rendering.
2. 🔴 BLOCKER — `DashboardShell`/Topbar lack a `pageTitle` prop channel.

**Files:**
- Modify: `src/components/layout/topbar.tsx`
- Modify: `src/app/(dashboard)/layout.tsx` (and any `DashboardShell` wrapper component if present)
- Modify: every page under `src/app/(dashboard)/**/page.tsx` that should pass a title (touch-list determined in Step 3)

- [ ] **Step 1: Read fragment 03 in full**

```
Read docs/superpowers/audits/fragments/03-dashboard.md
```

- [ ] **Step 2: Add `pageTitle` prop to `Topbar`**

Open `src/components/layout/topbar.tsx`. Add a typed prop and render slot:

```tsx
interface TopbarProps {
  user: { name: string; role: string; image?: string | null }
  pageTitle?: string
}

export function Topbar({ user, pageTitle }: TopbarProps) {
  return (
    <header className="h-[60px] border-b border-edge bg-surface-1 px-6 flex items-center">
      <h1 className="font-display text-[15px] font-bold tracking-[1px] text-ink-primary">
        {pageTitle ?? ""}
      </h1>
      {/* existing search + notification + avatar slots */}
    </header>
  )
}
```

Match the existing class names and structure rather than rewriting from scratch — only add the title slot and the prop.

- [ ] **Step 3: Plumb `pageTitle` from layout**

Open `src/app/(dashboard)/layout.tsx`. The current layout renders `<Topbar user={...} />`. Add a server-component pattern: read the current pathname via `headers()` (needs `await` per Next.js 16) and map it to a title via a small `pathToTitle` helper local to the layout.

```tsx
import { headers } from "next/headers"

const PATH_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/courses": "Courses",
  "/lessons": "Lessons",
  "/tasks": "Tasks",
  "/grades": "Grades",
  "/calendar": "Calendar",
  "/packages": "Packages",
  "/hardware": "Hardware Kits",
  "/users": "Users",
  "/settings": "Settings",
}

function pathToTitle(pathname: string): string {
  // Exact match first, then longest-prefix match for nested routes.
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname]
  const prefix = Object.keys(PATH_TITLES)
    .filter((p) => pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0]
  return prefix ? PATH_TITLES[prefix] : "Proxima"
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const headerStore = await headers()
  const pathname = headerStore.get("x-pathname") ?? headerStore.get("x-invoke-path") ?? "/dashboard"
  const pageTitle = pathToTitle(pathname)

  return (
    <div className="flex min-h-screen bg-surface-0">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Topbar user={user} pageTitle={pageTitle} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
```

If `x-pathname` is not present in Next.js 16's headers (it depends on middleware injection), add a one-line middleware tweak in Task 2's middleware file to set it:

```ts
const res = NextResponse.next()
res.headers.set("x-pathname", req.nextUrl.pathname)
return res
```

Apply that tweak in this task (not Task 2) since it's needed by the title plumbing.

- [ ] **Step 4: Manually sweep dashboard pages**

Run:

```bash
grep -l "Topbar" src/app/(dashboard)/
grep -l "DashboardShell" src/
```

For each consumer of `<Topbar>` outside the layout, confirm the new optional prop didn't break the call site (TypeScript will catch missing required props).

- [ ] **Step 5: Run verification gate**

```bash
npx tsc --noEmit
npm run build
```

Expected: green. Common failure mode: `headers()` not awaited — fix in same step.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/topbar.tsx src/app/(dashboard)/layout.tsx src/middleware.ts
git commit -m "$(cat <<'EOF'
fix(dashboard): close 2 findings from fragment 03

- topbar: add pageTitle prop + title slot rendering
- dashboard layout: derive pageTitle from awaited headers() pathname
- middleware: inject x-pathname header for layout title plumbing

Closes fragment 03 BLOCKER-1, BLOCKER-2.
EOF
)"
```

---

## Task 5: Courses Read (fragment 04) — 1 🔴 + 1 🔵

**Source fragment:** `docs/superpowers/audits/fragments/04-courses-read.md`

**Findings to close:**
1. 🔴 BLOCKER — Courses list page bypasses API and ignores `?level=`/`?search=` query params.
2. 🔵 POLISH — Module accordion chevron rotates 180° instead of 90°.

**Files:**
- Modify: `src/app/(dashboard)/courses/page.tsx`
- Modify: `src/components/courses/module-accordion.tsx`

- [ ] **Step 1: Read fragment 04 in full**
- [ ] **Step 2: Wire `?level=` and `?search=` through the courses page**

The page currently queries Prisma directly with role filtering. Add `searchParams` handling (Next.js 16 async pattern):

```tsx
export default async function CoursesPage(props: {
  searchParams: Promise<{ level?: string; search?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const { level, search } = await props.searchParams

  const where: Prisma.CourseWhereInput = {}
  if (level && ["ELEMENTARY", "HS", "COLLEGE"].includes(level)) {
    where.level = level as SchoolLevel
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (user.role === "STUDENT") {
    where.enrollments = { some: { studentId: user.id } }
  } else if (user.role === "TEACHER") {
    where.instructorId = user.id
  }
  // ADMIN: no extra scope

  const courses = await prisma.course.findMany({
    where,
    include: { instructor: true, _count: { select: { enrollments: true, modules: true } } },
    orderBy: { createdAt: "desc" },
  })

  return <CourseList courses={courses} role={user.role} />
}
```

Validate `level` against the enum literally (rejecting garbage strings instead of letting Prisma throw).

- [ ] **Step 3: Add a search input + level filter to `CourseList` (or the courses page)**

The filters need to be reachable from the UI for the BLOCKER to be closed. If `CourseList` doesn't already accept user input, add a small `<form method="GET">` above the grid with a search text input and a level select. Submitting reloads the page with the params — no client JS required.

```tsx
<form method="GET" className="mb-6 flex gap-2">
  <input
    name="search"
    defaultValue={searchParam ?? ""}
    placeholder="Search courses..."
    className="bg-surface-3 border border-edge rounded-md px-3 py-2 text-sm text-ink-primary"
  />
  <select
    name="level"
    defaultValue={levelParam ?? ""}
    className="bg-surface-3 border border-edge rounded-md px-3 py-2 text-sm text-ink-primary"
  >
    <option value="">All levels</option>
    <option value="ELEMENTARY">Elementary</option>
    <option value="HS">High School</option>
    <option value="COLLEGE">College</option>
  </select>
  <button type="submit" className="btn-primary">Filter</button>
</form>
```

- [ ] **Step 4: Fix module accordion chevron rotation**

Open `src/components/courses/module-accordion.tsx` line ~53-58. Replace `rotate-180` with `rotate-90` (or `-rotate-90` depending on the chevron's pointing direction — pick the one that visually opens downward when expanded, matching CLAUDE.md's spec).

- [ ] **Step 5: Run verification gate**

```bash
npx tsc --noEmit
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/(dashboard)/courses/page.tsx src/components/courses/module-accordion.tsx
git commit -m "fix(courses): close 2 findings from fragment 04

- courses page: honor ?level= and ?search= query params; add filter form
- module-accordion: rotate chevron 90° (was 180°)

Closes fragment 04 BLOCKER-1, POLISH-1."
```

---

## Task 6: Courses Write (fragment 05) — 1 🔴 + 1 🟡

**Source fragment:** `docs/superpowers/audits/fragments/05-courses-write.md`

**Findings to close:**
1. 🔴 BLOCKER — `createCourse` server action omits `isPublished: false`.
2. 🟡 BUG — PATCH `/api/courses/[courseId]` accepts arbitrary body fields (no Zod).

**Files:**
- Modify: `src/actions/course-actions.ts`
- Modify: `src/app/api/courses/[courseId]/route.ts`
- Modify: `src/lib/validations.ts` — add `updateCourseSchema = createCourseSchema.partial()`

- [ ] **Step 1: Read fragment 05**
- [ ] **Step 2: Add `updateCourseSchema` to validations**

```ts
// src/lib/validations.ts
export const updateCourseSchema = createCourseSchema.partial()
```

- [ ] **Step 3: Patch `createCourse` server action to set `isPublished: false`**

```ts
const course = await prisma.course.create({
  data: {
    ...parsed.data,
    tier: getTierFromLevel(parsed.data.level),
    instructorId: user.id,
    isPublished: false,
  },
})
```

- [ ] **Step 4: Validate PATCH route body against `updateCourseSchema`**

```ts
import { updateCourseSchema } from "@/lib/validations"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  const user = await requireRole(["TEACHER", "ADMIN"])
  const body = await request.json()
  const parsed = updateCourseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  // existing instructor/admin ownership check stays
  const course = await prisma.course.update({
    where: { id: courseId },
    data: parsed.data,
  })
  return NextResponse.json(course)
}
```

- [ ] **Step 5: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/actions/course-actions.ts src/app/api/courses/[courseId]/route.ts src/lib/validations.ts
git commit -m "fix(courses): close 2 findings from fragment 05

- createCourse action: explicitly set isPublished: false
- PATCH /api/courses/[id]: validate body against updateCourseSchema

Closes fragment 05 BLOCKER-1, BUG-2."
```

---

## Task 7: Modules & Lessons Write (fragment 06) — 3 🔵

**Source fragment:** `docs/superpowers/audits/fragments/06-modules-lessons-write.md`

**Findings to close:**
1. 🔵 PATCH `/api/modules/[moduleId]` lacks `revalidatePath`.
2. 🔵 PATCH `/api/lessons/[lessonId]` lacks `revalidatePath`.
3. 🔵 PATCH route bodies accept arbitrary fields (no Zod).

**Files:**
- Modify: `src/app/api/modules/[moduleId]/route.ts`
- Modify: `src/app/api/lessons/[lessonId]/route.ts`
- Modify: `src/lib/validations.ts` — add `updateModuleSchema`, `updateLessonSchema`

- [ ] **Step 1: Read fragment 06**
- [ ] **Step 2: Add partial schemas**

```ts
// src/lib/validations.ts
export const updateModuleSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  order: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
})

export const updateLessonSchema = createLessonSchema.partial().omit({ moduleId: true })
```

- [ ] **Step 3: Tighten module PATCH**

```ts
import { revalidatePath } from "next/cache"
import { updateModuleSchema } from "@/lib/validations"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ moduleId: string }> }
) {
  const { moduleId } = await props.params
  await requireRole(["TEACHER", "ADMIN"])
  const body = await request.json()
  const parsed = updateModuleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const updated = await prisma.module.update({
    where: { id: moduleId },
    data: parsed.data,
  })
  revalidatePath(`/courses/${updated.courseId}`)
  return NextResponse.json(updated)
}
```

- [ ] **Step 4: Tighten lesson PATCH** (mirror Step 3 with `updateLessonSchema` and revalidate `/lessons/${lessonId}` plus the parent course path).

- [ ] **Step 5: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/api/modules/[moduleId]/route.ts src/app/api/lessons/[lessonId]/route.ts src/lib/validations.ts
git commit -m "fix(modules-lessons): close 3 findings from fragment 06

- PATCH /api/modules/[id]: Zod validation + revalidatePath
- PATCH /api/lessons/[id]: Zod validation + revalidatePath
- validations: add updateModuleSchema and updateLessonSchema

Closes fragment 06 POLISH-1, POLISH-2, POLISH-3."
```

---

## Task 8: Lesson Viewer (fragment 07) — 1 🔴 + 2 🟡 + 1 🔵

**Source fragment:** `docs/superpowers/audits/fragments/07-lesson-viewer.md`

**Findings:**
1. 🔴 API lesson route omits ADMIN.
2. 🟡 Lesson page does not enforce enrollment.
3. 🟡 Quiz submit allows incomplete answer sets.
4. 🔵 Monaco theme registered after mount.

**Files:**
- Modify: `src/app/api/lessons/[lessonId]/route.ts`
- Modify: `src/app/(dashboard)/lessons/[lessonId]/page.tsx`
- Modify: `src/components/lessons/quiz-renderer.tsx`
- Modify: `src/components/lessons/code-editor.tsx`

- [ ] **Step 1: Read fragment 07**
- [ ] **Step 2: Add ADMIN branch to API authorization**

Open `src/app/api/lessons/[lessonId]/route.ts` GET handler. The current auth ladder (per fragment) checks enrolled-student then instructor. Add an explicit admin shortcut at the top:

```ts
const role = session.user.role
if (role !== "ADMIN") {
  // existing student/instructor checks
}
```

Or restructure to a positive allow-list:

```ts
const isAdmin = role === "ADMIN"
const isInstructor = lesson.module.course.instructorId === session.user.id
const isEnrolled = await prisma.enrollment.findUnique({
  where: { studentId_courseId: { studentId: session.user.id, courseId: lesson.module.courseId } },
}) != null
if (!isAdmin && !isInstructor && !isEnrolled) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

- [ ] **Step 3: Mirror the same authorization on the page**

Open `src/app/(dashboard)/lessons/[lessonId]/page.tsx`. After fetching the lesson via Prisma, run the same admin/instructor/enrolled check and call `notFound()` (or `forbidden()` from Next.js 16) on failure. Do NOT rely on the API guard since the page hits Prisma directly.

- [ ] **Step 4: Hard-validate quiz submission**

Open `src/components/lessons/quiz-renderer.tsx`. In the submit handler:

```ts
function handleSubmit() {
  const missing = questions.filter((q) => !(q.id in answers))
  if (missing.length > 0) {
    setError(`Please answer all ${questions.length} questions before submitting.`)
    return
  }
  setError(null)
  onSubmit(answers)
}
```

Add a `useState<string | null>(null)` for the error and render it above the submit button.

- [ ] **Step 5: Pre-register Monaco theme**

Open `src/components/lessons/code-editor.tsx`. The fragment notes the theme is set inside `onMount`. Move theme registration to module scope (or use `beforeMount`):

```tsx
import { Editor, type BeforeMount } from "@monaco-editor/react"

const beforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("proxima-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: { "editor.background": "#0D1117" },
  })
}

<Editor
  beforeMount={beforeMount}
  theme="proxima-dark"
  // ...
/>
```

- [ ] **Step 6: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/api/lessons/[lessonId]/route.ts src/app/(dashboard)/lessons/[lessonId]/page.tsx src/components/lessons/quiz-renderer.tsx src/components/lessons/code-editor.tsx
git commit -m "fix(lesson-viewer): close 4 findings from fragment 07

- API + page: authorize ADMIN/instructor/enrolled-student; mirror checks
- quiz-renderer: hard-validate complete answer set on submit
- code-editor: register theme via beforeMount to avoid first-paint flash

Closes fragment 07 BLOCKER-1, BUG-2, BUG-3, POLISH-4."
```

---

## Task 9: Tasks list/detail (fragment 08) — 9 🟡 + 5 🔵

**Source fragment:** `docs/superpowers/audits/fragments/08-tasks.md`

**This is the largest bucket.** If the implementer reports BLOCKED, split into 9a (API/route findings 3, 5, 6, 7, 8) and 9b (page/component findings 1, 2, 9, 10, 11, 12, 13, 14).

**Findings:**
1. 🟡 Tasks list hides DRAFT submissions for students.
2. 🟡 Tasks page ignores `?status=` and tab filters server-side.
3. 🟡 `GET /api/tasks` `?status=` unvalidated (500 instead of 400).
4. 🟡 Admin courseId branch lacks explicit role check.
5. 🟡 API ordering differs from page loader.
6. 🟡 `POST /api/tasks` accepts wrong-type fields per lesson.
7. 🟡 Re-submitting on GRADED retains stale grade/feedback/gradedAt.
8. 🟡 `GET /api/tasks/[taskId]` lacks explicit ADMIN check.
9. 🟡 `task-detail.tsx` doesn't handle TASK type submissions.
10. 🔵 CodeViewer language tag literal "CODE".
11. 🔵 Task table grade column visual distinction.
12. 🔵 Task table missing Course column on teacher view.
13. 🔵 Inline styles in code-viewer/video-player.
14. 🔵 Video player a11y (poster, preload, captions).

**Files:**
- Modify: `src/app/api/tasks/route.ts`
- Modify: `src/app/api/tasks/[taskId]/route.ts`
- Modify: `src/app/(dashboard)/tasks/page.tsx`
- Modify: `src/components/tasks/task-table.tsx`
- Modify: `src/components/tasks/task-detail.tsx`
- Modify: `src/components/tasks/code-viewer.tsx`
- Modify: `src/components/tasks/video-player.tsx`
- Modify: `src/lib/validations.ts` — add `tasksQuerySchema`

- [ ] **Step 1: Read fragment 08 in full**
- [ ] **Step 2: Add tasks query schema**

```ts
// src/lib/validations.ts
export const tasksQuerySchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "GRADED", "RETURNED"]).optional(),
  courseId: z.string().cuid().optional(),
  tab: z.enum(["all", "pending", "graded"]).optional(),
})
```

- [ ] **Step 3: Fix `GET /api/tasks` (findings 3, 4, 5)**

```ts
import { tasksQuerySchema } from "@/lib/validations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const parsed = tasksQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    courseId: searchParams.get("courseId") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { status, courseId } = parsed.data

  const where: Prisma.SubmissionWhereInput = {}
  if (status) where.status = status

  const role = session.user.role
  if (role === "STUDENT") {
    where.studentId = session.user.id
  } else if (role === "TEACHER") {
    where.lesson = { module: { course: { instructorId: session.user.id } } }
  } else if (role === "ADMIN") {
    if (courseId) where.lesson = { module: { courseId } }
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: { student: true, lesson: { include: { module: { include: { course: true } } } } },
    orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  })
  return NextResponse.json(submissions)
}
```

This closes findings 3, 4, 5 (status validation, explicit ADMIN, ordering parity) in one rewrite.

- [ ] **Step 4: Fix `POST /api/tasks` (findings 6, 7)**

For finding 6, accept fields by lesson type. Fetch the lesson first to learn its type, then validate against a discriminated union or just clear the inapplicable fields server-side:

```ts
const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId } })
if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

const data: Prisma.SubmissionUncheckedCreateInput = {
  studentId: session.user.id,
  lessonId: parsed.data.lessonId,
  status: "SUBMITTED",
  submittedAt: new Date(),
  // grade fields explicitly cleared on every (re)submit — fixes finding 7
  grade: null,
  gradedAt: null,
  feedback: null,
}

if (lesson.type === "CODE") data.codeContent = parsed.data.codeContent ?? null
else if (lesson.type === "VIDEO") data.videoUrl = parsed.data.videoUrl ?? null
else if (lesson.type === "QUIZ") data.quizAnswers = parsed.data.quizAnswers ?? Prisma.JsonNull
else if (lesson.type === "TASK") {
  // TASK accepts both code and video per task-submission.tsx
  data.codeContent = parsed.data.codeContent ?? null
  data.videoUrl = parsed.data.videoUrl ?? null
  data.fileUrl = parsed.data.fileUrl ?? null
}

const submission = await prisma.submission.upsert({
  where: { studentId_lessonId: { studentId: session.user.id, lessonId: parsed.data.lessonId } },
  create: data,
  update: data,
})
```

The explicit `grade: null, gradedAt: null, feedback: null` in the `update` payload is what closes finding 7 — re-submitting wipes the stale grade.

- [ ] **Step 5: Fix `GET /api/tasks/[taskId]` (finding 8)**

Replace the implicit fall-through with an explicit allow-list:

```ts
const role = session.user.role
const isOwner = submission.studentId === session.user.id
const isInstructor = submission.lesson.module.course.instructorId === session.user.id
const isAdmin = role === "ADMIN"
if (!isOwner && !isInstructor && !isAdmin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

- [ ] **Step 6: Fix tasks page server-side filtering (findings 1, 2)**

Open `src/app/(dashboard)/tasks/page.tsx`. Make it async with awaited `searchParams`, drop the `status: { not: "DRAFT" }` filter for students, and pass the tab through:

```tsx
export default async function TasksPage(props: {
  searchParams: Promise<{ tab?: string; courseId?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  const { tab, courseId } = await props.searchParams
  const activeTab = (tab as "all" | "pending" | "graded" | undefined) ?? "all"

  const where: Prisma.SubmissionWhereInput = {}
  if (user.role === "STUDENT") where.studentId = user.id
  else if (user.role === "TEACHER")
    where.lesson = { module: { course: { instructorId: user.id } } }

  if (activeTab === "pending") where.status = { in: ["DRAFT", "SUBMITTED"] }
  else if (activeTab === "graded") where.status = "GRADED"
  // "all" → no extra status filter; DRAFT now visible to students

  const submissions = await prisma.submission.findMany({
    where,
    include: { student: true, lesson: { include: { module: { include: { course: true } } } } },
    orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  })

  return <TasksClient submissions={submissions} role={user.role} activeTab={activeTab} />
}
```

If `<TasksClient>` exists, update it to render tab links as `<Link href="/tasks?tab=pending">` so URL is server-driven.

- [ ] **Step 7: Fix `task-detail.tsx` TASK-type rendering (finding 9)**

Open `src/components/tasks/task-detail.tsx` lines ~100-128. Replace the type ladder with one that handles `TASK`:

```tsx
{lesson.type === "CODE" && submission.codeContent && (
  <CodeViewer code={submission.codeContent} language="python" />
)}
{lesson.type === "VIDEO" && submission.videoUrl && (
  <VideoPlayer src={submission.videoUrl} />
)}
{lesson.type === "QUIZ" && submission.quizAnswers && (
  <QuizAnswersDisplay answers={submission.quizAnswers as Record<string, string>} />
)}
{lesson.type === "TASK" && (
  <>
    {submission.codeContent && <CodeViewer code={submission.codeContent} language="python" />}
    {submission.videoUrl && <VideoPlayer src={submission.videoUrl} />}
    {submission.fileUrl && (
      <a href={submission.fileUrl} className="btn-secondary">Download attachment</a>
    )}
    {!submission.codeContent && !submission.videoUrl && !submission.fileUrl && (
      <p className="text-ink-tertiary">No submission content available.</p>
    )}
  </>
)}
```

This unblocks the seeded Line Following Challenge submission.

- [ ] **Step 8: CodeViewer language label (finding 10)**

Open `src/components/tasks/code-viewer.tsx`. Make the language label optional and only render when set; the `task-detail` call now passes `language="python"` explicitly so the literal "CODE" disappears.

- [ ] **Step 9: Polish task table (findings 11, 12)**

Open `src/components/tasks/task-table.tsx`. For finding 11 (em-dash → "Pending" label):

```tsx
<td className="...">
  {row.grade != null
    ? <GradeCircle grade={row.grade} />
    : <span className="text-ink-ghost text-xs">Pending</span>}
</td>
```

For finding 12 (Course column on teacher/admin view): conditionally render after the Student column:

```tsx
{role !== "STUDENT" && (
  <th>Course</th>
)}
// in body:
{role !== "STUDENT" && (
  <td className="text-ink-secondary">{row.lesson.module.course.title}</td>
)}
```

- [ ] **Step 10: Convert code-viewer/video-player inline styles to Tailwind (finding 13)**

In `code-viewer.tsx` replace the inline `style={{ background: "#0D1117", ... }}` with Tailwind classes that map to the project's tokens (e.g. `bg-[#0D1117] text-[#C9D1D9] font-mono text-[13px] leading-[1.7] overflow-x-auto whitespace-pre-wrap p-4 rounded-md border border-edge`).

Same approach for `video-player.tsx`: replace inline styles with Tailwind.

- [ ] **Step 11: Video player a11y (finding 14)**

```tsx
<video
  src={src}
  controls
  preload="metadata"
  poster={poster}
  className="w-full rounded-md"
  aria-label={title ?? "Submission video"}
>
  <track kind="captions" srcLang="en" label="English" src={captionsUrl ?? ""} default />
</video>
```

If `poster`/`captionsUrl` aren't available from the data layer, leave them as optional props with no default — the `<track>` is still required for screen readers to announce missing captions.

- [ ] **Step 12: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/api/tasks/route.ts src/app/api/tasks/[taskId]/route.ts src/app/(dashboard)/tasks/page.tsx src/components/tasks/ src/lib/validations.ts
git commit -m "fix(tasks): close 14 findings from fragment 08

API:
- GET /api/tasks: Zod query validation, explicit ADMIN, submittedAt ordering
- GET /api/tasks/[id]: explicit allow-list (owner/instructor/admin)
- POST /api/tasks: type-aware field assignment; clear stale grade on resubmit

Page:
- tasks page: awaited searchParams, tab→status filter, drafts visible to students

Components:
- task-detail: render TASK submissions with code/video/file
- task-table: Pending label, Course column for teacher/admin view
- code-viewer/video-player: Tailwind classes; preload, aria-label, captions track

Closes fragment 08 BUG 1-9, POLISH 10-14."
```

---

## Task 10: Grading (fragment 09) — 3 🔵

**Source fragment:** `docs/superpowers/audits/fragments/09-grading.md`

**Findings:**
1. 🔵 PATCH route uses negative role check (`!== "STUDENT"`) instead of allow-list.
2. 🔵 PATCH route omits `revalidatePath`.
3. 🔵 Neither code path blocks re-grading already GRADED submissions.

**Files:**
- Modify: `src/app/api/tasks/[taskId]/grade/route.ts`
- Modify: `src/actions/grading-actions.ts`

- [ ] **Step 1: Read fragment 09**
- [ ] **Step 2: Allow-list role check + block re-grade + revalidate**

```ts
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/auth-helpers"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await props.params
  await requireRole(["TEACHER", "ADMIN"])
  const body = await request.json()
  const parsed = gradeTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const submission = await prisma.submission.findUnique({ where: { id: taskId } })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (submission.status === "GRADED") {
    return NextResponse.json({ error: "Already graded" }, { status: 409 })
  }

  const updated = await prisma.submission.update({
    where: { id: taskId },
    data: {
      status: "GRADED",
      gradedAt: new Date(),
      grade: parsed.data.grade,
      feedback: parsed.data.feedback ?? null,
    },
  })
  revalidatePath(`/tasks/${taskId}`)
  revalidatePath("/tasks")
  return NextResponse.json(updated)
}
```

Apply the same re-grade guard inside `grading-actions.ts` so the server action and the API agree.

- [ ] **Step 3: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/api/tasks/[taskId]/grade/route.ts src/actions/grading-actions.ts
git commit -m "fix(grading): close 3 findings from fragment 09

- PATCH route: allow-list role check + 409 on already-graded + revalidatePath
- grading action: same re-grade guard for parity

Closes fragment 09 LOW-1, LOW-2, LOW-3."
```

---

## Task 11: Grades page (fragment 10) — 1 🔴 + 2 🟡 + 4 🔵

**Source fragment:** `docs/superpowers/audits/fragments/10-grades.md`

**Findings:**
1. 🔴 Grades page hardcodes `studentId: user.id`; teachers/admins see empty page.
2. 🟡 `totalTasks` counts all lessons including non-gradable SLIDES.
3. 🟡 Redundant double-loop building `courseGradesMap`.
4. 🔵 Unused dead helpers in `utils.ts` using off-spec colors.
5. 🔵 Double `Math.round` on average.
6. 🔵 Threshold logic duplicated between `GradeCircle` and `utils.ts`.
7. 🔵 `duration-600` non-standard Tailwind class.

**Files:**
- Modify: `src/app/(dashboard)/grades/page.tsx`
- Modify: `src/lib/utils.ts`
- Modify: `src/components/grades/grade-distribution-chart.tsx`
- Modify (or read): `src/components/ui/grade-circle.tsx`

- [ ] **Step 1: Read fragment 10**
- [ ] **Step 2: Make grades page role-aware**

```tsx
const role = user.role
let where: Prisma.SubmissionWhereInput
if (role === "STUDENT") {
  where = { studentId: user.id, status: "GRADED" }
} else if (role === "TEACHER") {
  where = {
    status: "GRADED",
    lesson: { module: { course: { instructorId: user.id } } },
  }
} else { // ADMIN
  where = { status: "GRADED" }
}
const submissions = await prisma.submission.findMany({ where, include: { lesson: { include: { module: { include: { course: true } } } }, student: true } })
```

Pass `role` and the new `submissions` list down to summary cards / table / chart. The summary cards can switch on role to label themselves ("My Grades" vs "Class Grades" vs "All Grades").

- [ ] **Step 3: Filter `totalTasks` to gradable lesson types**

Replace the lesson count with one that filters:

```ts
const gradableLessons = await prisma.lesson.count({
  where: {
    type: { in: ["CODE", "QUIZ", "TASK"] },
    module: {
      course: role === "STUDENT"
        ? { enrollments: { some: { studentId: user.id } } }
        : role === "TEACHER"
          ? { instructorId: user.id }
          : {},
    },
  },
})
```

- [ ] **Step 4: Collapse the duplicate map loop**

Build `courseGradesMap` in one pass; remove `courseCompletedMap` (it's always `grades.length`).

- [ ] **Step 5: Delete unused helpers in `src/lib/utils.ts`**

```bash
grep -rn "getGradeColor\|getGradeBgColor\|getGradeLabel" src/
```

Confirm zero importers (other than the file itself). Delete the functions. If any importer is found, the audit was wrong — leave them and downgrade the finding to ⚪ NOTE in the commit body.

- [ ] **Step 6: Single-round average**

```ts
const averageGrade = grades.length > 0
  ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length)
  : 0
```

- [ ] **Step 7: Centralize grade tier logic**

Add a `gradeTier(grade: number): "A" | "B" | "C" | "F"` to `src/lib/utils.ts` and call it from both `GradeCircle` and the distribution chart. Remove the inline thresholds.

- [ ] **Step 8: Fix `duration-600` class**

Replace with `duration-500` or `duration-700` (or `[transition-duration:600ms]` for the exact 600ms). Verify in `grade-distribution-chart.tsx`.

- [ ] **Step 9: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/(dashboard)/grades/ src/components/grades/ src/lib/utils.ts src/components/ui/grade-circle.tsx
git commit -m "fix(grades): close 7 findings from fragment 10

- grades page: role-aware fetch (student/teacher/admin)
- gradable lesson count excludes SLIDES/VIDEO
- collapse duplicate courseGradesMap loop
- delete unused getGradeColor/BgColor/Label helpers
- single-round averageGrade
- centralize gradeTier helper, dedupe from GradeCircle
- distribution chart: fix non-standard duration class

Closes fragment 10 BLOCKER-1, BUG-2, BUG-3, POLISH-4..7."
```

---

## Task 12: Calendar (fragment 11) — 2 🔴 + 3 🟡 + 5 🔵

**Source fragment:** `docs/superpowers/audits/fragments/11-calendar.md`

**Findings:**
1. 🔴 Calendar page fetches all events, no role/enrollment filter.
2. 🔴 `createEventSchema.courseId` rejects empty string from "No course" option.
3. 🟡 No `revalidatePath`/`router.refresh` after create/delete.
4. 🟡 `?month=` query param has no validation.
5. 🟡 "Today" detection client-only.
6. 🔵 Event-list "this month" filter happens in JS.
7. 🔵 `deleteEvent` action not in spec, no per-event auth.
8. 🔵 Badge variant for `event` uses `info` instead of `signal`.
9. 🔵 No past-date guard on deadline input.
10. 🔵 Calendar GET fall-through path for unknown role.

**Files:**
- Modify: `src/app/(dashboard)/calendar/page.tsx`
- Modify: `src/app/api/calendar/route.ts`
- Modify: `src/actions/calendar-actions.ts`
- Modify: `src/lib/validations.ts` — fix `createEventSchema.courseId` coercion
- Modify: `src/components/calendar/calendar-grid.tsx`
- Modify: `src/components/calendar/event-list.tsx`
- Modify: `src/components/calendar/create-event-form.tsx`

- [ ] **Step 1: Read fragment 11**
- [ ] **Step 2: Fix `createEventSchema.courseId` to coerce empty string**

```ts
courseId: z
  .string()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.string().cuid().optional())
  .optional(),
```

This closes finding 2 (BLOCKER) — empty string becomes `undefined` before the cuid check.

- [ ] **Step 3: Make calendar page role-filtered**

```tsx
const role = user.role
let courseFilter: Prisma.CalendarEventWhereInput
if (role === "STUDENT") {
  courseFilter = {
    OR: [
      { courseId: null },
      { course: { enrollments: { some: { studentId: user.id } } } },
    ],
  }
} else if (role === "TEACHER") {
  courseFilter = {
    OR: [{ courseId: null }, { course: { instructorId: user.id } }],
  }
} else {
  courseFilter = {} // admin
}

const { month } = await props.searchParams
const monthMatch = month ? /^\d{4}-(0[1-9]|1[0-2])$/.exec(month) : null
const monthFilter = monthMatch
  ? {
      date: {
        gte: new Date(`${month}-01T00:00:00Z`),
        lt: new Date(new Date(`${month}-01T00:00:00Z`).setMonth(new Date(`${month}-01T00:00:00Z`).getMonth() + 1)),
      },
    }
  : {}

const events = await prisma.calendarEvent.findMany({
  where: { AND: [courseFilter, monthFilter] },
  orderBy: { date: "asc" },
})
```

This closes findings 1 (BLOCKER), 4 (month validation), 6 (no JS-side filter), 10 (defensive role handling).

- [ ] **Step 4: Mirror month validation in API GET**

Apply the same regex check to `src/app/api/calendar/route.ts` GET handler. Return 400 on bad input.

- [ ] **Step 5: Add `revalidatePath` to actions**

```ts
// in createEvent + deleteEvent
revalidatePath("/calendar")
revalidatePath("/dashboard")
```

If the form/list is client-rendered and `revalidatePath` alone is insufficient, also call `router.refresh()` in the form's success handler.

- [ ] **Step 6: Add per-event auth to `deleteEvent`**

```ts
const event = await prisma.calendarEvent.findUnique({ where: { id }, include: { course: true } })
if (!event) throw new Error("Not found")
if (event.courseId) {
  if (user.role !== "ADMIN" && event.course?.instructorId !== user.id) {
    throw new Error("Forbidden")
  }
} else {
  if (user.role !== "ADMIN") throw new Error("Forbidden") // global events admin-only
}
```

- [ ] **Step 7: Fix today detection (server-truth)**

Pass `today` from the server (`new Date().toISOString().slice(0, 10)`) into `<CalendarGrid>` as a prop instead of computing in client. Closes finding 5.

- [ ] **Step 8: Match badge color for event variant**

Open `src/components/calendar/event-list.tsx`. The badge for `type === "event"` uses `info`; change to use the `signal` semantic so it matches the dot color in the grid (per spec). Closes finding 8.

- [ ] **Step 9: Past-date guard on create-event-form**

Add `min={today}` to the date input and Zod refinement to reject past dates server-side.

- [ ] **Step 10: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/(dashboard)/calendar/ src/app/api/calendar/route.ts src/actions/calendar-actions.ts src/lib/validations.ts src/components/calendar/
git commit -m "fix(calendar): close 10 findings from fragment 11

- page: role-filtered query (student/teacher/admin) + month validation
- schema: coerce empty courseId to undefined before cuid check
- API GET: same month regex
- actions: revalidatePath after create/delete; per-event auth in deleteEvent
- grid: today comes from server prop
- list: signal badge color for event variant
- form: min date guard

Closes fragment 11 BLOCKER 1-2, BUG 3-5, POLISH 6-10."
```

---

## Task 13: Packages (fragment 12) — 5 🟡

**Source fragment:** `docs/superpowers/audits/fragments/12-packages.md`

**Findings:**
1. 🟡 API requires authentication, spec says open to any role.
2. 🟡 Subscribe button labeled "Browse Courses" linking to `/courses?level=...`.
3. 🟡 Price rendered in PHP (₱) not USD whole-dollar.
4. 🟡 Stats grid shows Courses + Lessons; spec says Modules + Lessons.
5. 🟡 Card uses full border instead of hairline + 3px top accent.

**Files:**
- Modify: `src/app/api/packages/route.ts`
- Modify: `src/components/packages/package-card.tsx`
- Modify: `src/app/(dashboard)/packages/page.tsx` (for module count)

- [ ] **Step 1: Read fragment 12**
- [ ] **Step 2: Drop auth check from `GET /api/packages`**

Spec says "any role". Either remove the session check entirely, or downgrade to a `try { await auth() } catch {}` that doesn't return 401. Verify the route's only effect is "list active packages".

- [ ] **Step 3: Compute modules + lessons counts**

In the page loader, fetch packages with the related module/lesson counts:

```ts
const packages = await prisma.lessonPackage.findMany({
  where: { isActive: true },
  include: {
    courses: {
      include: {
        modules: { include: { _count: { select: { lessons: true } } } },
      },
    },
  },
})

const enriched = packages.map((p) => {
  const moduleCount = p.courses.reduce((sum, c) => sum + c.modules.length, 0)
  const lessonCount = p.courses.reduce(
    (sum, c) => sum + c.modules.reduce((s, m) => s + m._count.lessons, 0),
    0
  )
  return { ...p, moduleCount, lessonCount }
})
```

- [ ] **Step 4: Update `package-card.tsx`**

- Subscribe button label `"Subscribe"` (currently "Browse Courses") with primary button styling.
- Stats grid two boxes: Modules (`{moduleCount}`) and Lessons (`{lessonCount}`).
- Price formatted with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })`.
- Container styling: `bg-surface-2 border-t-[3px] border-t-{tier} shadow-card rounded-lg` (drop the full `border border-edge`).

- [ ] **Step 5: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/api/packages/route.ts src/app/(dashboard)/packages/page.tsx src/components/packages/package-card.tsx
git commit -m "fix(packages): close 5 findings from fragment 12

- API: drop auth gate; spec says public
- card: 'Subscribe' label, USD price, hairline + 3px top accent
- page: compute modules + lessons counts and pass through

Closes fragment 12 BUG 1-5."
```

---

## Task 14: Hardware (fragment 13) — 2 🔴 + 5 🟡 + 5 🔵

**Source fragment:** `docs/superpowers/audits/fragments/13-hardware.md`

**This bucket carries the first Prisma migration.**

**Findings:**
1. 🔴 (P0) `POST /api/hardware/assign` no Zod, no user check.
2. 🔴 (P0) `@@unique([kitId, userId])` blocks return-then-reissue.
3. 🟡 (P1) Page uses `redirect` denylist, not `requireRole`.
4. 🟡 (P1) `assign-kit-modal.tsx` orphaned.
5. 🟡 (P1) `GET /api/hardware` unused (page bypasses).
6. 🟡 (P1) `returnKit` action lacks ownership scoping.
7. 🟡 (P1) `createKit`/`updateKit` bypass Zod; cast `level` with `as any`.
8. 🔵 (P2) `KitCard` allows negative `available`.
9. 🔵 (P2) `LevelBadge` raw string vs typed enum.
10. 🔵 (P2) Modal student list unfiltered.
11. 🔵 (P2) Modal assumes `error` is string in one branch.
12. 🔵 (P2) Spec font-role drift on stats.

**Files:**
- Modify: `prisma/schema.prisma` (drop @@unique, add @@index)
- Create: `prisma/migrations/<timestamp>_relax_hardware_assignment_unique/migration.sql` (auto-generated by `migrate dev`)
- Modify: `src/app/api/hardware/assign/route.ts`
- Modify: `src/app/api/hardware/route.ts` (or remove if confirming dead)
- Modify: `src/actions/hardware-actions.ts`
- Modify: `src/app/(dashboard)/hardware/page.tsx`
- Modify: `src/components/hardware/kit-card.tsx`
- Modify: `src/components/hardware/assign-kit-modal.tsx` (or delete if orphan confirmed)
- Modify: `src/lib/validations.ts` — add `assignKitSchema`, `createKitSchema`, `updateKitSchema`

- [ ] **Step 1: Read fragment 13 in full**

- [ ] **Step 2: Pre-migration sanity snapshot**

```bash
npx prisma db execute --schema prisma/schema.prisma --stdin <<'EOF'
SELECT count(*) AS total FROM "HardwareAssignment";
SELECT count(*) AS active FROM "HardwareAssignment" WHERE "returnedAt" IS NULL;
SELECT "kitId", "userId", count(*) FROM "HardwareAssignment" GROUP BY "kitId", "userId" HAVING count(*) > 1;
EOF
```

Record the totals in the commit body. The third query MUST return zero rows; if it returns any, halt — there are existing duplicates that the unique constraint was masking. Resolve with the user before continuing.

- [ ] **Step 3: Edit `prisma/schema.prisma`**

Find `model HardwareAssignment`. Replace `@@unique([kitId, userId])` with `@@index([kitId, userId])`.

- [ ] **Step 4: Run migration**

```bash
npx prisma migrate dev --name relax_hardware_assignment_unique
```

Expected: migration applied, Prisma client regenerated. If it errors, stop and surface to controller.

- [ ] **Step 5: Post-migration sanity check**

Re-run the same `count(*)` queries from Step 2. Totals must match. Record in commit body.

- [ ] **Step 6: Add Zod schemas for hardware operations**

```ts
// src/lib/validations.ts
export const assignKitSchema = z.object({
  kitId: z.string().cuid(),
  userId: z.string().cuid(),
})
export const createKitSchema = z.object({
  name: z.string().min(2).max(100),
  level: z.enum(["ELEMENTARY", "HS", "COLLEGE"]),
  specs: z.string().min(2),
  totalQty: z.number().int().min(0),
  imageEmoji: z.string().max(8).default("🤖"),
})
export const updateKitSchema = createKitSchema.partial()
```

- [ ] **Step 7: Tighten `POST /api/hardware/assign`**

```ts
import { assignKitSchema } from "@/lib/validations"

export async function POST(request: Request) {
  await requireRole(["TEACHER", "ADMIN"])
  const body = await request.json()
  const parsed = assignKitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { kitId, userId } = parsed.data

  const [kit, user] = await Promise.all([
    prisma.hardwareKit.findUnique({ where: { id: kitId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])
  if (!kit) return NextResponse.json({ error: "Kit not found" }, { status: 404 })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const activeCount = await prisma.hardwareAssignment.count({
    where: { kitId, returnedAt: null },
  })
  if (activeCount >= kit.totalQty) {
    return NextResponse.json({ error: "Kit fully assigned" }, { status: 409 })
  }

  const existingActive = await prisma.hardwareAssignment.findFirst({
    where: { kitId, userId, returnedAt: null },
  })
  if (existingActive) {
    return NextResponse.json({ error: "User already has this kit" }, { status: 409 })
  }

  const assignment = await prisma.hardwareAssignment.create({ data: { kitId, userId } })
  revalidatePath("/hardware")
  return NextResponse.json(assignment, { status: 201 })
}
```

- [ ] **Step 8: Replace page redirect with `requireRole`**

```tsx
export default async function HardwarePage() {
  await requireRole(["TEACHER", "ADMIN"])
  // ... existing content
}
```

- [ ] **Step 9: Resolve `assign-kit-modal.tsx` orphan**

```bash
grep -rn "assign-kit-modal" src/
```

If the page uses `AssignKitTrigger` instead, delete `assign-kit-modal.tsx`. If both are used, leave both — the audit was wrong.

- [ ] **Step 10: Decide GET /api/hardware**

The page bypasses the API. Either:
- Wire the page to use the API (preferred for SSOT), OR
- Delete `src/app/api/hardware/route.ts` and document the choice in the commit body.

The faster fix is delete + document.

- [ ] **Step 11: Scope `returnKit` action**

```ts
const assignment = await prisma.hardwareAssignment.findUnique({ where: { id }, include: { kit: true } })
if (!assignment) throw new Error("Not found")
// teachers/admins can return any kit; students can only return their own
if (user.role === "STUDENT" && assignment.userId !== user.id) {
  throw new Error("Forbidden")
}
```

- [ ] **Step 12: Validate createKit / updateKit**

Replace `as any` casts with the new Zod schemas inside `createKit` and `updateKit` actions. Reject `totalQty` below current active assignment count when updating (data integrity).

- [ ] **Step 13: Clamp `KitCard` available count**

```tsx
const available = Math.max(0, kit.totalQty - kit.activeAssignments)
const pct = kit.totalQty > 0 ? Math.min(100, (kit.activeAssignments / kit.totalQty) * 100) : 0
```

- [ ] **Step 14: Type `LevelBadge` against the Prisma enum**

```tsx
import type { SchoolLevel } from "@prisma/client"
interface LevelBadgeProps { level: SchoolLevel }
```

- [ ] **Step 15: Filter modal student list**

In `assign-kit-modal.tsx` (or `AssignKitTrigger`), exclude users who already have an active assignment for the chosen kit. Server-side fetch should pre-filter.

- [ ] **Step 16: Modal error narrowing**

Wherever the modal does `if (error) { ... toString }`, narrow with `typeof error === "string" ? error : error?.message ?? "Failed"` so the bad branch can't crash.

- [ ] **Step 17: Verification gate + commit**

```bash
npx tsc --noEmit
npx prisma validate
npm run build
git add prisma/ src/app/api/hardware/ src/actions/hardware-actions.ts src/app/(dashboard)/hardware/ src/components/hardware/ src/lib/validations.ts
git commit -m "$(cat <<'EOF'
fix(hardware): close 12 findings from fragment 13

Schema:
- migration: relax_hardware_assignment_unique
  drops @@unique([kitId, userId]); replaces with @@index for lookup
  pre/post-migration row counts identical (see body)

API:
- POST /api/hardware/assign: Zod, kit/user existence, capacity, no-active-dup
- GET /api/hardware: <removed | wired into page>

Actions:
- createKit/updateKit: Zod schemas; totalQty cannot drop below active count
- returnKit: ownership scoping for students

Page + components:
- page: requireRole allow-list (was negative redirect)
- KitCard: clamp available, clamp progress percentage
- LevelBadge: typed against Prisma enum
- assign modal: filter out duplicate assignees, narrow error
- assign-kit-modal.tsx: <deleted as orphan | retained>

Closes fragment 13 BLOCKER 1-2, BUG 3-7, POLISH 8-12.

Pre-migration: total=<X>, active=<Y>
Post-migration: total=<X>, active=<Y>
EOF
)"
```

---

## Task 15: Users (Admin) (fragment 14) — 4 🟡 + 4 🔵

**Source fragment:** `docs/superpowers/audits/fragments/14-users.md`

**Findings:**
1. 🟡 (M1) Admin can self-demote/lock themselves out.
2. 🟡 (M2) `updateUser` writes empty-string department.
3. 🟡 (M3) Modal can't clear `schoolLevel`.
4. 🟡 (M4) `?role=` query param unvalidated.
5. 🔵 (L1) Page bypasses `/api/users`.
6. 🔵 (L2) `updateUserSchema.department` no length bound.
7. 🔵 (L3) Modal doesn't refresh on save.
8. 🔵 (L4) Modal can't edit name.

**Files:**
- Modify: `src/app/api/users/route.ts`
- Modify: `src/app/api/users/[userId]/route.ts`
- Modify: `src/actions/user-actions.ts`
- Modify: `src/app/(dashboard)/users/page.tsx`
- Modify: `src/components/users/edit-user-modal.tsx`
- Modify: `src/lib/validations.ts`

- [ ] **Step 1: Read fragment 14**
- [ ] **Step 2: Tighten `updateUserSchema`**

```ts
export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
  department: z.string().max(100).nullable().optional(),
  schoolLevel: z.enum(["ELEMENTARY", "HS", "COLLEGE"]).nullable().optional(),
})
```

- [ ] **Step 3: Self-demote guard in `updateUser` action**

```ts
const sessionUser = await requireRole(["ADMIN"])
if (sessionUser.id === targetUserId && parsed.data.role && parsed.data.role !== "ADMIN") {
  return { error: "Admins cannot demote themselves" }
}
```

Mirror the same guard in `PATCH /api/users/[userId]`.

- [ ] **Step 4: Coerce empty-string department + schoolLevel**

```ts
const data = {
  ...parsed.data,
  department: parsed.data.department === "" ? null : parsed.data.department,
}
```

- [ ] **Step 5: Modal: enable "— None —" for schoolLevel and add name input**

```tsx
<select name="schoolLevel" defaultValue={user.schoolLevel ?? ""}>
  <option value="">— None —</option>
  <option value="ELEMENTARY">Elementary</option>
  <option value="HS">High School</option>
  <option value="COLLEGE">College</option>
</select>
```

In the form submit handler, send `schoolLevel: value === "" ? null : value` (the schema will accept null).

Add a name input field and include it in the submit payload.

After successful save, call `router.refresh()` so the table updates.

- [ ] **Step 6: Validate `?role=` in `GET /api/users`**

```ts
const role = searchParams.get("role")
if (role && !["STUDENT", "TEACHER", "ADMIN"].includes(role)) {
  return NextResponse.json({ errors: { role: ["Invalid role"] } }, { status: 400 })
}
```

- [ ] **Step 7: Wire users page to API (or document inversion)**

The fastest fix is to keep the page as a server component using Prisma, but parse `searchParams` (with the same Zod schema) so the URL surface is consistent. Alternatively call the API via fetch — pick whichever matches the rest of the codebase. Document choice in commit body.

- [ ] **Step 8: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/app/api/users/ src/actions/user-actions.ts src/app/(dashboard)/users/ src/components/users/ src/lib/validations.ts
git commit -m "fix(users-admin): close 8 findings from fragment 14

- updateUserSchema: add max lengths, nullable fields
- updateUser action + PATCH route: block admin self-demotion
- empty-string department coerced to null
- modal: clear schoolLevel via null, edit name field, router.refresh on save
- GET /api/users: validate ?role= param
- users page: parse searchParams via shared schema

Closes fragment 14 BUG 1-4, POLISH 5-8."
```

---

## Task 16: Settings (fragment 15) — 4 🟡 + 7 🔵

**Source fragment:** `docs/superpowers/audits/fragments/15-settings.md`

**Findings:**
1. 🟡 (P1) `updateProfile` + `changePassword` lack Zod validation.
2. 🟡 (P1) `department` editable by students despite no model meaning.
3. 🟡 (P1) Name change doesn't refresh JWT/sidebar.
4. 🟡 (P1) `updateProfile` doesn't `revalidatePath("/", "layout")`.
5. 🔵 (P2) Password change doesn't invalidate other sessions.
6. 🔵 (P2) No rate limit on `changePassword`.
7. 🔵 (P2) Email field disabled-only (no server guarantee).
8. 🔵 (P2) `changePassword` doesn't `revalidatePath`.
9. 🔵 (P2) Manual pending state instead of `useActionState`.
10. 🔵 (P2) `useUnsavedChanges` warns on bare current-password input.
11. 🔵 (P2) Toasts not cleared on unmount.

**Files:**
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Modify: `src/actions/settings-actions.ts` (or wherever the actions live)
- Modify: `src/components/settings/*` (form components)
- Modify: `src/lib/validations.ts` — add `updateProfileSchema`, `changePasswordSchema`
- Modify: `src/hooks/use-unsaved-changes.ts` (if present)

- [ ] **Step 1: Read fragment 15**
- [ ] **Step 2: Add Zod schemas**

```ts
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
  department: z.string().max(100).nullable().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).max(128),
}).refine((d) => d.currentPassword !== d.newPassword, {
  message: "New password must differ from current",
  path: ["newPassword"],
})
```

- [ ] **Step 3: Validate inputs in actions**

`updateProfile`: parse with `updateProfileSchema`. Ignore `department` if `sessionUser.role === "STUDENT"` (or silently strip the field). Server-side enforce email immutability — never read `email` from form data.

`changePassword`: parse with `changePasswordSchema`. Compare current password via bcrypt, hash new at cost 12.

- [ ] **Step 4: Refresh JWT after name change**

After updating the user's name, return a flag like `{ success: true, sessionStale: true }` and have the client call `signIn("credentials", { redirect: false })` is too heavy — instead use `await unstable_update({ name: newName })` from `next-auth/jwt` (Auth.js v5 supports `update` on the session via `useSession`). Fall back to `router.refresh()` + `revalidatePath("/", "layout")` if `unstable_update` is not available.

- [ ] **Step 5: `revalidatePath("/", "layout")` for both actions**

`revalidatePath("/", "layout")` flushes the entire dashboard layout tree so the sidebar user block refreshes.

- [ ] **Step 6: Use `useActionState` for form pending state**

Replace manual `isPending` `useState` with React 19's `useActionState` hook. This also gives the form a clean error surface.

- [ ] **Step 7: Make `useUnsavedChanges` ignore bare current-password**

In the hook, treat `currentPassword` as dirty only when `newPassword` is also non-empty.

- [ ] **Step 8: Clear toasts on unmount**

In whatever toast hook is used in the settings page, add a `useEffect` cleanup that calls `dismiss()` on unmount.

- [ ] **Step 9: Verification gate + commit**

```bash
npx tsc --noEmit
npm run build
git add src/actions/settings-actions.ts src/app/(dashboard)/settings/ src/components/settings/ src/lib/validations.ts src/hooks/
git commit -m "fix(settings): close 11 findings from fragment 15

- actions: Zod validation; server-side email immutability
- updateProfile: revalidatePath('/', 'layout'); JWT refresh after name change
- department field gated to non-student roles
- changePassword: revalidatePath; new-must-differ refinement
- forms: useActionState for pending; toast cleanup on unmount
- useUnsavedChanges: ignore bare current-password field

Closes fragment 15 BUG 1-4, POLISH 5-11."
```

---

## Task 17: Announcements (fragment 16) — 1 🔴 + 3 🟡 + 4 🔵

**Source fragment:** `docs/superpowers/audits/fragments/16-announcements.md`

**This bucket carries the second Prisma migration.**

**Findings:**
1. 🔴 No Zod validation on `POST /api/announcements`.
2. 🟡 `GET` has no limit/pagination.
3. 🟡 Dashboard bypasses the API entirely.
4. 🟡 `priority` is raw `String` (should be enum).
5. 🔵 Missing `updatedAt`/edit/delete surfaces.
6. 🔵 `relativeTime()` uses client-side `new Date()` inside an RSC.
7. 🔵 No priority ordering.
8. 🔵 Badge variant coverage incomplete.

**Files:**
- Modify: `prisma/schema.prisma` (priority enum)
- Create: `prisma/migrations/<timestamp>_announcement_priority_enum/migration.sql` (auto)
- Modify: `src/app/api/announcements/route.ts`
- Modify: `src/actions/announcement-actions.ts`
- Modify: `src/components/dashboard/announcements-panel.tsx`
- Modify: `src/lib/validations.ts` — `createAnnouncementSchema`
- Modify: any badge variants component if needed

- [ ] **Step 1: Read fragment 16**

- [ ] **Step 2: Pre-migration sanity**

```bash
npx prisma db execute --schema prisma/schema.prisma --stdin <<'EOF'
SELECT count(*) AS total FROM "Announcement";
SELECT DISTINCT "priority" FROM "Announcement";
EOF
```

Confirm only `'normal'` and `'high'` exist (per seed). If other values appear, halt.

- [ ] **Step 3: Add backfill SQL via `migrate dev`**

Edit `prisma/schema.prisma`:

```prisma
enum AnnouncementPriority {
  LOW
  NORMAL
  HIGH
}

model Announcement {
  // ...
  priority AnnouncementPriority @default(NORMAL)
  // ...
}
```

Then:

```bash
npx prisma migrate dev --create-only --name announcement_priority_enum
```

This generates the migration without applying. Open the generated `migration.sql` and **prepend** the backfill before the type change:

```sql
-- Backfill existing string values to uppercase
UPDATE "Announcement" SET "priority" = upper("priority") WHERE "priority" IS NOT NULL;

-- Then the auto-generated CREATE TYPE / ALTER COLUMN statements follow
```

Apply:

```bash
npx prisma migrate dev
```

Re-run the count + distinct queries from Step 2 to confirm row count unchanged and only enum values remain.

- [ ] **Step 4: Add `createAnnouncementSchema`**

```ts
export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(2).max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
})
```

- [ ] **Step 5: Validate POST + add pagination to GET**

```ts
const PAGE_SIZE = 50

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    include: { author: true },
  })
  return NextResponse.json(announcements)
}

export async function POST(request: Request) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  const body = await request.json()
  const parsed = createAnnouncementSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const announcement = await prisma.announcement.create({
    data: { ...parsed.data, authorId: user.id },
  })
  revalidatePath("/dashboard")
  return NextResponse.json(announcement, { status: 201 })
}
```

- [ ] **Step 6: Mirror schema in `createAnnouncement` action**

Update `src/actions/announcement-actions.ts` to use the same `createAnnouncementSchema`.

- [ ] **Step 7: Move relative-time computation to client wrapper**

Open `src/components/dashboard/announcements-panel.tsx`. The `relativeTime()` call inside the RSC computes against the server clock at render time. Convert the time-display child to a small `"use client"` component (`<RelativeTime iso={createdAt} />`) that runs `new Date()` on the client.

- [ ] **Step 8: Update badge variant for priority**

If a `<PriorityBadge>` exists, ensure it has variants for `LOW`/`NORMAL`/`HIGH`.

- [ ] **Step 9: Verification gate + commit**

```bash
npx tsc --noEmit
npx prisma validate
npm run build
git add prisma/ src/app/api/announcements/ src/actions/announcement-actions.ts src/components/dashboard/announcements-panel.tsx src/lib/validations.ts src/components/ui/
git commit -m "$(cat <<'EOF'
fix(announcements): close 8 findings from fragment 16

Schema:
- migration: announcement_priority_enum
  string -> enum AnnouncementPriority { LOW, NORMAL, HIGH }
  backfill prepended to migration.sql; row count preserved

API:
- POST: requireRole(TEACHER/ADMIN) + Zod
- GET: pagination (50/page); priority desc + createdAt desc

Components:
- announcements-panel: extract <RelativeTime/> client child
- priority badge variants for LOW/NORMAL/HIGH

Closes fragment 16 BLOCKER-1, BUG 2-4, POLISH 5-8.

Pre-migration: total=<X>
Post-migration: total=<X>
EOF
)"
```

---

## Task 18: Final wrap

**Files:**
- Create: `docs/superpowers/audits/2026-04-08-deferred-notes.md`
- Modify: nothing else

- [ ] **Step 1: Re-run the full verification gate against branch HEAD**

```bash
npx tsc --noEmit
npx prisma validate
npm run build
```

All three must pass. If anything fails, the implementer goes back to the offending bucket — do not proceed.

- [ ] **Step 2: Generate the deferred ⚪ NOTES doc**

Walk every fragment in `docs/superpowers/audits/fragments/` and extract every `### ⚪ NOTE` (or `### [INFO]`, `### N1`/`N2`/..., etc.) finding. For each, write a row in:

```markdown
# Deferred Audit ⚪ NOTES — 2026-04-08

These findings from the 2026-04-08 E2E audit were intentionally NOT closed by
the fix-pass on `fix/e2e-audit-cleanup`. They are tracked here for a future
runtime/refactor pass.

| # | Fragment | Title | Reason for deferral |
|---|---|---|---|
| 1 | 02-auth | PrismaAdapter cast-to-any | Cosmetic; type works at runtime |
| 2 | 02-auth | searchParams not awaited in login | False positive — client component |
| ... | ... | ... | ... |
```

Aim for ~38 rows (one per ⚪ note in the audit).

- [ ] **Step 3: Spot-check a sample of closed findings**

Pick 5 random closed findings from across the buckets, re-read the fragment's "Expected" line, and check the live code at `file:line` matches. If any mismatch, return to the relevant bucket.

- [ ] **Step 4: Commit the deferred-notes doc**

```bash
git add docs/superpowers/audits/2026-04-08-deferred-notes.md
git commit -m "docs(audit): track 38 deferred ⚪ NOTES from E2E audit

Findings out of scope for fix/e2e-audit-cleanup branch."
```

- [ ] **Step 5: Push branch and open PR**

```bash
git push -u origin fix/e2e-audit-cleanup
gh pr create --title "fix: close 99 findings from 2026-04-08 E2E audit" --body "$(cat <<'EOF'
## Summary

Closes all 12 🔴 BLOCKER, 41 🟡 BUG, and 46 🔵 POLISH findings from the
2026-04-08 E2E audit. 38 ⚪ NOTE findings deferred and tracked in
`docs/superpowers/audits/2026-04-08-deferred-notes.md`.

**Source:**
- Spec: `docs/superpowers/specs/2026-04-08-e2e-audit-fixes-design.md`
- Audit report: `docs/superpowers/audits/2026-04-08-e2e-audit-report.md`
- Plan: `docs/superpowers/plans/2026-04-08-e2e-audit-fixes.md`

## Changes by feature area

(Generated from commit log — list each fix bucket and the closed findings.)

## Database migrations

1. `relax_hardware_assignment_unique` — drops `@@unique([kitId, userId])`,
   replaces with `@@index`. Pre/post counts identical.
2. `announcement_priority_enum` — converts `Announcement.priority` from
   `String` to `AnnouncementPriority` enum. Backfill applied to existing rows.

## Test plan

- [x] `npx tsc --noEmit` clean
- [x] `npx prisma validate` clean
- [x] `npm run build` succeeds
- [ ] Manual smoke: log in as student, teacher, admin; visit each page
- [ ] Manual smoke: re-submit a graded task — confirm grade resets
- [ ] Manual smoke: assign + return + reassign a hardware kit (closes BLOCKER #11)
- [ ] Manual smoke: create a calendar event with "No course" selected (closes BLOCKER #9)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: Report to user**

Post a summary in chat: total commits, closed finding count by severity, the two migrations applied, and the PR URL.

---

## Reference: Per-bucket finding counts

| Task | Fragment | 🔴 | 🟡 | 🔵 | Total |
|---|---|---|---|---|---|
| 2 | 17 cross-cutting | 0 | 0 | 4 | 4 |
| 3 | 02 auth | 1 | 3 | 0 | 4 |
| 4 | 03 dashboard | 2 | 0 | 0 | 2 |
| 5 | 04 courses-read | 1 | 0 | 1 | 2 |
| 6 | 05 courses-write | 1 | 1 | 0 | 2 |
| 7 | 06 modules-lessons-write | 0 | 0 | 3 | 3 |
| 8 | 07 lesson-viewer | 1 | 2 | 1 | 4 |
| 9 | 08 tasks | 0 | 9 | 5 | 14 |
| 10 | 09 grading | 0 | 0 | 3 | 3 |
| 11 | 10 grades | 1 | 2 | 4 | 7 |
| 12 | 11 calendar | 2 | 3 | 5 | 10 |
| 13 | 12 packages | 0 | 5 | 0 | 5 |
| 14 | 13 hardware | 2 | 5 | 5 | 12 |
| 15 | 14 users | 0 | 4 | 4 | 8 |
| 16 | 15 settings | 0 | 4 | 7 | 11 |
| 17 | 16 announcements | 1 | 3 | 4 | 8 |
| **Total** | | **12** | **41** | **46** | **99** |
