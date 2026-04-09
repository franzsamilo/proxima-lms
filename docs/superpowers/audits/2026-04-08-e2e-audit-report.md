# E2E Audit Report — 2026-04-08

## Summary
- **Total findings:** 137 (🔴 12 · 🟡 41 · 🔵 46 · ⚪ 38)
- **Coverage:** 17/17 features audited; 17 pages and 19 API routes referenced
- **Environment:** code audit ✓; runtime checks deferred (code-only fallback per spec §3)
- **Auditor:** automated walkthrough following `docs/superpowers/specs/2026-04-08-e2e-audit-design.md`

### Top 🔴 Blockers
- **Auth:** Middleware uses manual `getToken()` instead of the spec-prescribed `auth()` HOF wrapper from `@/lib/auth`.
- **Dashboard:** Topbar has no page-title slot — left side is blank on every dashboard page.
- **Dashboard:** `DashboardShell` / `Topbar` props expose no `pageTitle` channel, so the title cannot be passed in.
- **Courses (Read):** `/courses` page bypasses `GET /api/courses` and ignores the spec'd `?level=` / `?search=` query params.
- **Courses (Write):** `createCourse` server action omits `isPublished: false`, drifting from the API route and spec contract.
- **Lesson Viewer:** `GET /api/lessons/[lessonId]` denies ADMIN — admin role never reaches the allow branch.
- **Grades:** Page hardcodes `studentId: user.id` regardless of role; teachers and admins see an empty grades page.
- **Calendar:** `/calendar` page fetches every event with no role/enrollment filter — students see other courses' deadlines.
- **Calendar:** `createEventSchema` rejects empty-string `courseId`, so picking "No course" in the create modal always fails validation.
- **Hardware:** `POST /api/hardware/assign` has no Zod validation, no user existence check, and no active-assignment guard.
- **Hardware:** `HardwareAssignment.@@unique([kitId, userId])` makes "return then re-issue" impossible — every re-assign throws P2002.
- **Announcements:** `POST /api/announcements` accepts arbitrary JSON with no Zod validation; `priority` is unconstrained.

## Findings by Feature

## 2. Auth & Session
**What it should do:** JWT-based credentials auth via Auth.js v5 with role-aware middleware redirects and registration via bcrypt hashing.

### 🔴 BLOCKER: Middleware implementation pattern mismatch
- **Feature:** Auth & Session
- **Location:** src/middleware.ts:1-35
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** `export default auth((req) => { ... })` - wraps middleware function with NextAuth's auth() HOF for automatic token/session injection
- **Actual:** `async function middleware(req: NextRequest) { ... }` with manual `getToken()` call
- **Repro:** In src/middleware.ts, the middleware is NOT wrapped with the `auth()` function from src/lib/auth.ts. Spec shows auth.js v5 pattern of exporting middleware wrapped with `auth()`, but code manually calls `getToken()` instead.
- **Notes:** This deviates from Auth.js v5 recommended pattern. The current approach still works (manual getToken is valid), but it's not the spec-prescribed pattern. In Auth.js v5, the `auth()` HOF provides better type safety and automatic token refresh handling. Consider refactoring to: `import { auth } from "@/lib/auth"; export default auth((req) => { const isLoggedIn = !!req.auth; ... })`. This would eliminate the need for manual getToken and secret handling.

### 🟡 BUG: SchoolLevel enum mismatch between register page and schema
- **Feature:** Auth & Session (Registration)
- **Location:** src/app/(auth)/register/page.tsx:12, src/lib/validations.ts:14
- **Roles affected:** STUDENT
- **Expected (per schema):** registerSchema defines schoolLevel enum as ["ELEMENTARY", "HS", "COLLEGE"]
- **Actual:** RegisterPage component defines SchoolLevel type as "ELEMENTARY" | "HIGH_SCHOOL" | "COLLEGE" and renders option values as "HIGH_SCHOOL" instead of "HS"
- **Repro:** Register as STUDENT, select "High School" level, form will submit "HIGH_SCHOOL" to /api/auth/register but validation schema expects "HS". Zod validation will fail with status 400.
- **Notes:** This is a breaking bug for student registration. Fix: update registerPage.tsx line 12 to use "HS" instead of "HIGH_SCHOOL" in type and options, or update validations.ts line 14 to accept "HIGH_SCHOOL".

### 🟡 BUG: Register API error response format mismatch
- **Feature:** Auth & Session (Registration)
- **Location:** src/app/api/auth/register/route.ts:11, 16; src/app/(auth)/register/page.tsx:66-69
- **Roles affected:** ALL (on registration error)
- **Expected (per spec):** Both validation errors and duplicate email should use consistent response format
- **Actual:** Line 11 returns `{ error: parsed.error.flatten().fieldErrors }` (error key with fieldErrors object), line 16 returns `{ error: "Email already registered" }` (error key with string). Client code checks for `data.errors` (plural) at line 66.
- **Repro:** (1) Submit form with validation error → receives `{ error: {...} }` but client checks `data.errors` (undefined). (2) Email duplicate → receives `{ error: "string" }`, client tries `data.errors` (undefined), falls through to `data.message` which doesn't exist. Both cases will show generic "Registration failed" instead of specific errors.
- **Notes:** Client expects `{ errors: ... }` (plural) but API returns `{ error: ... }` (singular). Fix: change API responses to use `errors` key, or update client error handling to check `data.error` instead of `data.errors`.

### 🟡 BUG: Middleware matcher includes icon.svg instead of logo.svg
- **Feature:** Auth & Session
- **Location:** src/middleware.ts:34
- **Roles affected:** ALL (minor)
- **Expected (per CLAUDE.md spec):** matcher should exclude "logo.svg" (the actual asset referenced in the spec)
- **Actual:** matcher excludes "icon.svg" but per CLAUDE.md file structure, the asset is "logo.svg"
- **Repro:** Request to /public/logo.svg will trigger middleware check; /public/icon.svg will be skipped. This is a minor asset routing issue.
- **Notes:** Inconsistency between spec and implementation. Unclear if icon.svg exists in public dir. Either update matcher to exclude "logo.svg" per spec, or clarify the actual asset filename.

### ⚪ NOTE: PrismaAdapter cast-to-any
- **Feature:** Auth & Session
- **Location:** src/lib/auth.ts:8
- **Roles affected:** ALL
- **Expected (per spec):** PrismaAdapter should be properly typed
- **Actual:** `adapter: PrismaAdapter(prisma) as any` - uses `as any` type assertion
- **Notes:** Runtime-functional but masks potential type mismatches. Low risk in practice. Consider removing `as any` if @auth/prisma-adapter types are compatible with setup.

### ⚪ NOTE: Next.js 16 searchParams not awaited in login page
- **Feature:** Auth & Session (Login)
- **Location:** src/app/(auth)/login/page.tsx:20
- **Roles affected:** ALL
- **Expected (per Next.js 16 spec):** searchParams is a Promise in Next.js 16 and must be awaited
- **Actual:** `const searchParams = useSearchParams()` - uses hook directly (client component context)
- **Repro:** Runtime test required. In this case, `useSearchParams()` is client-side hook, so no await needed. Code is correct.
- **Notes:** This is actually correct for client components. No fix needed.

---

**Coverage:** code-audited src/lib/auth.ts, src/lib/auth-helpers.ts, src/middleware.ts, src/app/api/auth/[...nextauth]/route.ts, src/app/api/auth/register/route.ts, src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx, src/types/next-auth.d.ts, src/lib/validations.ts; runtime checks deferred (code-only fallback).

## 3. Dashboard
**What it should do:** Role-adaptive stats grid (Student: Enrolled Courses, Pending Tasks, Average Grade, Progress; Teacher: Active Courses, Pending Reviews, Total Students, Completion Rate; Admin: Total Courses, Active Users, Hardware Kits, Packages) + announcements panel + recent activity + upcoming events; sidebar/topbar/mobile shell with role-gated nav.

### 🔴 BLOCKER: Topbar Missing Page Title
- **Feature:** Dashboard / Layout Shell
- **Location:** src/components/layout/topbar.tsx:95-196
- **Roles affected:** All
- **Expected (per CLAUDE.md):** Topbar left side displays "page title in Syne 15px weight-700, tracking 1px, `ink-primary`" (e.g., "Dashboard", "Courses", "Tasks")
- **Actual:** Topbar only renders mobile hamburger menu button on left; jumps directly to search/bell/avatar on right. No page title space/logic present.
- **Repro:** Load any dashboard page (e.g., /dashboard, /courses, /tasks). Observe topbar has blank left side; no page identifier.

### 🔴 BLOCKER: DashboardShell Missing Page Title Data Prop
- **Feature:** Dashboard Layout Shell
- **Location:** src/app/(dashboard)/dashboard-shell.tsx:16-20, src/components/layout/topbar.tsx:8-14
- **Roles affected:** All
- **Expected (per CLAUDE.md):** Topbar prop `pageTitle?: string` to receive current page name from layout/parent; Topbar renders it.
- **Actual:** DashboardShellProps interface has no pageTitle field. Topbar component has no pageTitle prop in TopbarProps. No data flow exists to pass page context from layout/page to topbar.
- **Repro:** No mechanism to inject page title into topbar. Spec requirement cannot be satisfied without prop addition.

### ⚪ NOTE: Announcements/Events Fetched in Layout (Non-blocking Pattern)
- **Feature:** Dashboard Layout
- **Location:** src/app/(dashboard)/layout.tsx:10-39
- **Roles affected:** All
- **Expected (per CLAUDE.md):** "Dashboard page is async and fetches per-role stats"; announcements should be in /dashboard page.
- **Actual:** Announcements and upcoming events fetched in layout.tsx, passed to DashboardShell for topbar notifications dropdown. Dashboard page re-fetches announcements for AnnouncementsPanel. This creates data duplication but enables topbar notifications feature not explicitly in spec.
- **Repro:** N/A — runtime behavior. Fetches are correct and data flows properly; spec is ambiguous on topbar notifications source.

---

## Verification Summary

**Compliant (spec-aligned):**
- Dashboard page is `async` (line 163); redirects unauthenticated users (line 165).
- Role-adaptive stats: `getStudentStats()` (9-48), `getTeacherStats()` (50-86), `getAdminStats()` (88-103) with correct metrics.
- AnnouncementsPanel orders by `createdAt desc` ✓
- Sidebar logo, role gating, active nav state, topbar dimensions, mobile hamburger all spec-compliant.

**Total findings:** 2 BLOCKER, 0 BUG, 0 POLISH, 1 NOTE

## 4. Courses (Read)
**What it should do:** Role-scoped course listing + course detail page with nested modules → lessons tree.

### 🔴 BLOCKER: Courses list page bypasses API and ignores level/search query params
- **Feature:** Courses (Read)
- **Location:** src/app/(dashboard)/courses/page.tsx:24-52
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** `GET /api/courses` is the role-scoped lister and supports `?level=` and `?search=` query params. Courses page should honor those filters (or consistently use the API).
- **Actual:** The page queries Prisma directly with role filtering. The `?level=` and `?search=` filters supported by the API route are not passed through or applied at the page level, so users have no way to invoke them via the UI.
- **Repro:** Visit `/courses?level=COLLEGE&search=robotics` — filters have no effect.
- **Notes:** Either remove the unused query params from the API or wire them through the page's `searchParams`. The dual fetch path (page → Prisma direct, API → also Prisma) is also a SSOT smell.

### 🔵 POLISH: Module accordion chevron rotates 180° instead of 90°
- **Feature:** Courses (Read) — Module accordion
- **Location:** src/components/courses/module-accordion.tsx:53-58
- **Roles affected:** ALL
- **Expected (per CLAUDE.md "Module Accordion"):** chevron rotates 90° when expanded, 200ms transition.
- **Actual:** Uses `rotate-180` class. Transition timing (200ms) is correct.
- **Notes:** Cosmetic; not functionally broken.

### ⚪ NOTE: Hydration / async params behavior at runtime
- **Feature:** Courses (Read)
- **Location:** runtime
- **Roles affected:** ALL
- **Notes:** Static review confirms `await props.params` is used in dynamic routes. Hydration warnings, devtools errors, and Monaco/quiz mount issues require runtime verification — deferred per code-only audit fallback.

---

**Coverage:** code-audited src/app/(dashboard)/courses/page.tsx, src/app/(dashboard)/courses/[courseId]/page.tsx, src/app/api/courses/route.ts, src/app/api/courses/[courseId]/route.ts, course-card.tsx, course-list.tsx, module-accordion.tsx, lesson-item.tsx, course-timeline.tsx; runtime checks deferred.

## 5. Courses (Write)
**What it should do:** Role-gated create/edit/delete for courses + student self-enroll.

### 🔴 BLOCKER: Server Action createCourse missing isPublished: false
- **Feature:** Courses (Write) — Create
- **Location:** src/actions/course-actions.ts:23-28
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md):** createCourse must auto-set `isPublished: false` per spec table row 1214
- **Actual:** Server action creates course without setting `isPublished: false`. Only the `POST /api/courses` route (line 83) sets it. Server action omits it, relying on Prisma default, which may cause inconsistency if default changes.

**Impact:** Courses created via server action may not match spec contract. API route behaves correctly.

### 🟡 BUG: API route PATCH /api/courses/[courseId] lacks input validation
- **Feature:** Courses (Write) — Update
- **Location:** src/app/api/courses/[courseId]/route.ts:74-78
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md):** PATCH should validate input with `createCourseSchema.partial()` (per Server Actions pattern, line 1245-1272 of CLAUDE.md)
- **Actual:** `const body = await request.json()` → `data: body` passed directly to Prisma without validation. Allows arbitrary field mutation (e.g., `instructorId`, `createdAt`, `tier`).

**Impact:** Authorization is enforced (instructorId check present), but no schema validation. Instructor could mutate unintended fields like `tier` or `maxStudents` directly.

### ⚪ NOTE: Date transformation via createCourseSchema
- **Location:** src/lib/validations.ts:25-26
- **Note:** Schema transforms `startDate` and `endDate` strings to `Date` objects. Form sends strings (type="date"). Server action and API both accept strings — schema handles transform. Matches spec pattern.

**Findings:** 1 BLOCKER, 1 BUG, 1 NOTE. All async params correctly awaited. Role checks and authorization working. Cascade deletions verified in schema.

## 6. Modules & Lessons (Write)
**What it should do:** Teacher/admin-gated CRUD for course modules and their lessons via server actions and JSON API routes, with auto-ordering and Zod validation.

### 🔵 POLISH: PATCH `/api/modules/[moduleId]` lacks `revalidatePath` after mutation
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/api/modules/[moduleId]/route.ts (PATCH handler)
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md Server Actions pattern):** mutating endpoints should `revalidatePath()` so consumer pages refresh.
- **Actual:** Mutation succeeds but no path revalidation, so course detail pages may show stale data until next dynamic render.

### 🔵 POLISH: PATCH `/api/lessons/[lessonId]` lacks `revalidatePath` after mutation
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/api/lessons/[lessonId]/route.ts (PATCH handler)
- **Roles affected:** TEACHER, ADMIN
- **Expected:** Mutations call `revalidatePath()` so the lesson viewer + course pages refresh.
- **Actual:** No revalidation call observed.

### 🔵 POLISH: PATCH route bodies accept arbitrary fields (no Zod validation)
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/api/modules/[moduleId]/route.ts and src/app/api/lessons/[lessonId]/route.ts (PATCH handlers)
- **Roles affected:** TEACHER, ADMIN
- **Expected:** All write endpoints validate inbound payloads with the relevant Zod schema (server actions do).
- **Actual:** PATCH handlers spread the request body into `prisma.update`. Form-driven actions validate, but anyone calling the API directly bypasses schema checks.

### ⚪ NOTE: Module/lesson creation UI exists in edit page only
- **Location:** src/app/(dashboard)/courses/[courseId]/edit/* (forms exist), course detail page (no inline create)
- **Notes:** Spec doesn't strictly require inline creation on the read page, so this is informational.

---

**Coverage:** code-audited module-actions.ts, lesson-actions.ts, validations.ts (createModuleSchema/createLessonSchema), api/courses/[courseId]/modules/route.ts, api/modules/[moduleId]/route.ts, api/modules/[moduleId]/lessons/route.ts, api/lessons/[lessonId]/route.ts, plus the related edit-page forms.

## 7. Lesson Viewer
**What it should do:** Server page resolves a lesson by id, gates access, and switches on `lesson.type` to render SLIDES (markdown), CODE (Monaco), QUIZ (radio), TASK (form), or VIDEO.

### 🔴 BLOCKER: API lesson route omits ADMIN from authorized viewers
- **Feature:** Lesson Viewer
- **Location:** src/app/api/lessons/[lessonId]/route.ts:42-44 (GET handler)
- **Roles affected:** ADMIN
- **Expected (per CLAUDE.md API table):** `GET /api/lessons/[lessonId]` is accessible to "Enrolled/Instructor/Admin".
- **Actual:** Authorization branch permits enrolled students and the parent course's instructor, but never falls through to allow `role === "ADMIN"`. Admins receive a 403 even though they should always have access.
- **Repro:** Sign in as `admin@proxima.edu`, hit `/api/lessons/<any-lesson-id>` → blocked.

### 🟡 BUG: Lesson page does not enforce enrollment/instructor authorization
- **Feature:** Lesson Viewer
- **Location:** src/app/(dashboard)/lessons/[lessonId]/page.tsx:18-19
- **Roles affected:** STUDENT
- **Expected:** Only enrolled students (or teachers/admins) may view a lesson. Page should mirror the API guard.
- **Actual:** The page checks `auth()` only — any logged-in user who guesses or browses to a lesson id can view it because the page fetches via Prisma directly without an enrollment check. The API enforces auth, but the page does not call the API; it queries Prisma straight.
- **Repro:** Sign in as a student not enrolled in course X, navigate to a lesson belonging to course X → page renders.

### 🟡 BUG: Quiz submit allows incomplete answer sets
- **Feature:** Lesson Viewer — quiz
- **Location:** src/components/lessons/quiz-renderer.tsx:162
- **Roles affected:** STUDENT
- **Expected:** A quiz submission should require an answer for every question.
- **Actual:** The submit guard only checks `Object.keys(answers).length < questions.length`, but `answers` is keyed by question id; if a student answers Q1 then deselects, the count math can permit a sparse submission. Even at face value, the validation gate is shown only by disabling the button — there is no guard on the submit handler itself.

### 🔵 POLISH: Monaco theme registered after mount, causing first-paint flash
- **Feature:** Lesson Viewer — code editor
- **Location:** src/components/lessons/code-editor.tsx:98-107
- **Roles affected:** ALL
- **Expected:** Editor renders in the customized dark theme on first paint.
- **Actual:** Theme is defined and applied inside `onMount`, so the editor briefly shows the default `vs-dark` palette before switching. Cosmetic.

### ⚪ NOTE: Hydration / Monaco runtime behavior
- **Notes:** Confirming "no hydration warnings", "Monaco mounts cleanly", "quiz round-trips a submission", and "video player plays" requires a real browser session — deferred per code-only audit fallback.

---

**Coverage:** code-audited src/app/(dashboard)/lessons/[lessonId]/page.tsx, src/app/api/lessons/[lessonId]/route.ts, slide-viewer.tsx, code-editor.tsx, quiz-renderer.tsx, task-submission.tsx.

## 8. Submissions & Tasks list/detail
**What it should do:** Role-scoped task list and detail views for student submissions, with grade display and status tabs (All / Pending / Graded), plus code viewer, video player, and quiz answer renderer.

### 🟡 BUG — Tasks list hides DRAFT submissions for students
- **Location:** src/app/(dashboard)/tasks/page.tsx:28, 43, 53
- **Roles affected:** STUDENT
- **Expected:** `GET /api/tasks` returns "Students: their submissions" with no qualifier. A student's in-progress drafts should be visible.
- **Actual:** The page-level data loader hardcodes `status: { not: "DRAFT" }` for all roles, so a student who has started a task never sees it in /tasks. The companion `GET /api/tasks` route does NOT apply this filter — page and API disagree.

### 🟡 BUG — Tasks page ignores spec'd `?status=` and tab filters server-side
- **Location:** src/app/(dashboard)/tasks/page.tsx:59-86
- **Roles affected:** ALL
- **Expected:** "Tabs: All / Pending / Graded." Tasks page should support filtering by status.
- **Actual:** The server page fetches all submissions and delegates to `<TasksClient>` without reading `searchParams`. URL-shareable tab state not supported.

### 🟡 BUG — `GET /api/tasks` status filter is unvalidated and accepts arbitrary strings
- **Location:** src/app/api/tasks/route.ts:14-21
- **Roles affected:** ALL
- **Expected:** `?status=` should be constrained to `SubmissionStatus` enum values.
- **Actual:** `where.status = status` assigns the raw query string. `?status=FOO` will reach Prisma and throw a 500 instead of a clean 400.

### 🟡 BUG — Admin-only courseId filter silently ignores non-admin scoping
- **Location:** src/app/api/tasks/route.ts:36-43
- **Roles affected:** ADMIN
- **Expected:** Admin sees "all" with `?courseId=` narrowing.
- **Actual:** No explicit ADMIN check — any non-STUDENT/non-TEACHER role is treated as admin. Authorization widening risk.

### 🟡 BUG — `GET /api/tasks` ordering differs from page loader (createdAt vs submittedAt)
- **Location:** src/app/api/tasks/route.ts:51 vs src/app/(dashboard)/tasks/page.tsx:29
- **Roles affected:** ALL
- **Actual:** API orders by `createdAt`, page loader orders by `submittedAt`. Inconsistency between consumers.

### 🟡 BUG — `POST /api/tasks` upsert accepts any field regardless of lesson type
- **Location:** src/app/api/tasks/route.ts:101-126
- **Roles affected:** STUDENT
- **Actual:** A student can submit a VIDEO lesson with only codeContent. Viewer falls through to "No submission content available" when field↔type don't match.

### 🟡 BUG — `POST /api/tasks` upsert overwrites grade state without resetting grade fields
- **Location:** src/app/api/tasks/route.ts:101-126
- **Roles affected:** STUDENT, TEACHER
- **Expected:** Re-submitting after grading should reset grade/gradedAt/feedback.
- **Actual:** Update block sets status back to SUBMITTED but leaves `grade`, `gradedAt`, `feedback` from prior cycle.

### 🟡 BUG — `GET /api/tasks/[taskId]` permits any non-STUDENT/non-TEACHER role
- **Location:** src/app/api/tasks/[taskId]/route.ts:33-46
- **Roles affected:** ADMIN (and any unexpected role)
- **Actual:** Only STUDENT and TEACHER branches checked. Should explicitly allow only `ADMIN` as fallback.

### 🟡 BUG — `task-detail.tsx` renders no content for TASK lesson type
- **Location:** src/components/tasks/task-detail.tsx:100-128
- **Roles affected:** ALL
- **Expected:** TASK lessons submit code/video — viewer should render both for TASK type.
- **Actual:** Branch ladder only shows code for `CODE`, video for `VIDEO`. Seeded line-following submission shows "No submission content available" despite having a videoUrl. Correctness blocker for demo flows.

### 🔵 POLISH — CodeViewer language tag label
- **Location:** src/components/tasks/code-viewer.tsx:1-50
- **Actual:** `task-detail.tsx` passes `language="code"` which renders a literal "CODE" uppercase label instead of a real language.

### 🔵 POLISH — Task table "Grade" column shows em-dash for SUBMITTED rows
- **Location:** src/components/tasks/task-table.tsx:63-67, 129-134
- **Actual:** A "Pending" label might read better than em-dash.

### 🔵 POLISH — Task table missing a "Course" column on teacher view
- **Location:** src/components/tasks/task-table.tsx:86-97
- **Roles affected:** TEACHER, ADMIN

### 🔵 POLISH — Inline style objects instead of Tailwind in code-viewer / video-player
- **Location:** src/components/tasks/code-viewer.tsx:10-47, src/components/tasks/video-player.tsx:12-28

### 🔵 POLISH — Video player lacks poster, preload, and accessibility title/captions
- **Location:** src/components/tasks/video-player.tsx:20-32

### ⚪ NOTE — `submitTaskSchema.quizAnswers` uses Zod v4 two-arg form
- **Location:** src/lib/validations.ts:47

### ⚪ NOTE — Page loader uses its own query instead of `GET /api/tasks` (two sources of truth)

### ⚪ NOTE — Runtime checks deferred

**Coverage:** src/app/(dashboard)/tasks/page.tsx, src/app/(dashboard)/tasks/[taskId]/page.tsx, src/app/api/tasks/route.ts, src/app/api/tasks/[taskId]/route.ts, src/actions/task-actions.ts, src/components/tasks/task-table.tsx, src/components/tasks/task-detail.tsx, src/components/tasks/code-viewer.tsx, src/components/tasks/video-player.tsx, src/lib/validations.ts.

## 9. Grading
**What it should do:** Teacher/admin can grade a submitted task with score+feedback; submission transitions to GRADED with `gradedAt` timestamp; grading form is only shown to teachers/admins on ungraded submissions.

### [LOW] API route does not enforce STUDENT-only block via role enum check
- **Location:** src/app/api/tasks/[taskId]/grade/route.ts:16-19
- **Observed:** `if (userRole === "STUDENT") return 403`. Any other value (including unexpected/null) is treated as authorized.
- **Expected:** Positive allow-list (`if (!["TEACHER","ADMIN"].includes(userRole))`).

### [LOW] API route does not call revalidatePath after grading
- **Location:** src/app/api/tasks/[taskId]/grade/route.ts:55-65
- **Observed:** PATCH handler updates and returns JSON with no `revalidatePath`. Server action does revalidate. Inconsistency between two grading paths.

### [LOW] API route does not block re-grading already-graded submissions
- **Location:** src/app/api/tasks/[taskId]/grade/route.ts:21-66
- **Observed:** No status check before update — a GRADED submission can be re-graded via PATCH.

### [INFO] Form does not surface field-level Zod errors
- **Location:** src/components/tasks/grading-form.tsx:28-37

### [INFO] Empty feedback string is persisted instead of null
- **Location:** src/actions/grading-actions.ts:18-32

### Verified correct
- Async params awaited correctly. ✓
- `gradedAt: new Date()` set on update in BOTH paths. ✓
- `status: "GRADED"` transition set in both paths. ✓
- `gradeTaskSchema` matches spec. ✓
- Teacher ownership check on PATCH. ✓

**Coverage:** src/app/api/tasks/[taskId]/grade/route.ts, src/actions/grading-actions.ts, src/components/tasks/grading-form.tsx, src/lib/validations.ts.

## 10. Grades

**Scope:** `src/app/(dashboard)/grades/page.tsx`, grade summary cards, grade table, distribution chart, grade helpers.

### [HIGH] Role handling missing — teachers and admins see empty grades page

**File:** `src/app/(dashboard)/grades/page.tsx:17-46`

Spec says the Grades page should show "student's submissions (or all submissions for teacher's courses, or all for admin)." The implementation hardcodes `studentId: user.id` regardless of role. A logged-in TEACHER or ADMIN will see no course summaries and no graded rows.

No branching on `user.role`. Teachers should query submissions where `lesson.module.course.instructorId === user.id`; admins should query all.

### [MEDIUM] Summary "totalTasks" counts every lesson, not just gradable ones

**File:** `src/app/(dashboard)/grades/page.tsx:96-99`

`totalTasks` includes SLIDES lessons (non-gradable). The "X/Y tasks" progress on each summary card misrepresents progress.

### [MEDIUM] Duplicated pass over submissions when building summaries

**File:** `src/app/(dashboard)/grades/page.tsx:80-91`

`courseGradesMap` and `courseCompletedMap` are computed in two separate loops; the second is redundant.

### [LOW] `getGradeColor` / `getGradeBgColor` / `getGradeLabel` helpers are unused and off-spec

**File:** `src/lib/utils.ts:21-40`

Helpers return hardcoded Tailwind palette classes that don't match the theme tokens. Either remove or rewrite to return semantic tokens.

### [LOW] `averageGrade` double-rounded

**File:** `src/app/(dashboard)/grades/page.tsx:101-104` and `src/components/grades/grade-summary-cards.tsx:49`

### [LOW] `GradeCircle` threshold logic is duplicated from `utils.ts`

**File:** `src/components/ui/grade-circle.tsx:8-13` vs `src/lib/utils.ts:21-33`

### [LOW] Distribution chart bar uses non-standard Tailwind duration class

**File:** `src/components/grades/grade-distribution-chart.tsx:46`

`duration-600` is not a default Tailwind duration; the bar will not animate to width.

### [INFO] Spec-conformant items observed
- Page is async server component, fetches via Prisma, redirects unauth'd.
- `GradeDistributionChart` is `"use client"`.
- `GradeCircle` thresholds match spec.

## 11. Calendar

Scope: src/app/(dashboard)/calendar/page.tsx, calendar-view.tsx, src/app/api/calendar/route.ts, calendar-actions.ts, calendar-grid.tsx, event-list.tsx, create-event-form.tsx, validations.ts (createEventSchema).

### HIGH-1 — Calendar page ignores role-based event filtering from spec
**File:** `src/app/(dashboard)/calendar/page.tsx:12-23`
The page fetches **all** `calendarEvent` rows directly via Prisma with no `where` clause. The spec requires: "Events filtered by role's enrolled courses + null courseId events". This is correctly implemented in `/api/calendar` but the page bypasses the API. Students see deadlines and exams for courses they are not enrolled in. The `?month=YYYY-MM` filter is also not applied server-side.

### HIGH-2 — `createEventSchema` `courseId` cannot receive `""`
**File:** `src/lib/validations.ts:56-61`, `src/actions/calendar-actions.ts:15`, `src/components/calendar/create-event-form.tsx:122-123`
The "No course" option in the select has `value=""`. `formData.get("courseId")` returns `""`, which `?? undefined` does not collapse, so Zod's `z.string().cuid().optional()` rejects it. Users picking "No course" always see a validation error.

### MEDIUM-1 — No `revalidatePath` or refetch after creating an event via server action
**File:** `src/components/calendar/create-event-form.tsx:34-47`, `src/actions/calendar-actions.ts:29`
`createEvent` calls `revalidatePath("/calendar")` but `CalendarView` is `"use client"` and never calls `router.refresh()`. New events not visible until manual navigation.

### MEDIUM-2 — `/api/calendar` GET month filter does not parse fallback
**File:** `src/app/api/calendar/route.ts:44-52`
Malformed `month` (e.g. `2026-13`) → `Invalid Date` → Prisma 500.

### MEDIUM-3 — Calendar grid "today" detection uses client clock only
**File:** `src/components/calendar/calendar-grid.tsx:43-46`
No bug — flagging for awareness.

### LOW-1 — Event list "this month" filter happens in JS, defeats any server-side month scoping
**File:** `src/app/(dashboard)/calendar/calendar-view.tsx:36-47`

### LOW-2 — Create event form lacks client-side date min
**File:** `src/components/calendar/create-event-form.tsx:98-103`

### LOW-3 — `deleteEvent` action not in spec, no authorization scoping
**File:** `src/actions/calendar-actions.ts:33-43`
Any teacher can delete any other teacher's or admin's events.

### LOW-4 — Badge variant for `event` uses `info` but spec dot color is `signal`
**File:** `src/components/calendar/event-list.tsx:23-27` vs `src/components/calendar/calendar-grid.tsx:21-25`

### LOW-5 — `/api/calendar` GET allows missing role to fall through
**File:** `src/app/api/calendar/route.ts:17-41`

### INFO-1 — All client components correctly marked
### INFO-2 — No dynamic route params in calendar area
### INFO-3 — Grid structure matches spec

## 12. Packages
**What it should do:** List active `LessonPackage` records as three tier-colored cards.

### 🟡 BUG: API route requires authentication, spec says "Any"
- **Location:** src/app/api/packages/route.ts:6-9
- **Notes:** "Any" is ambiguous; current implementation matches "any authenticated role" reading.

### 🟡 BUG: Spec requires "Subscribe" button, implementation renders "Browse Courses"
- **Location:** src/components/packages/package-card.tsx:131-135
- **Actual:** Renders `<Button>Browse Courses</Button>` linking to course list filtered by level.

### 🟡 BUG: Price rendered in PHP (₱) with 2 decimal places, spec uses USD whole-dollar
- **Location:** src/components/packages/package-card.tsx:85
- **Actual:** Displays `₱299.00 / package` instead of `$299`.

### 🟡 BUG: Stats grid shows Courses + Lessons, spec shows Modules + Lessons
- **Location:** src/components/packages/package-card.tsx:93-110; src/app/(dashboard)/packages/page.tsx:27-46
- **Actual:** First stat box labeled "Courses" and counts `pkg.courses.length`.

### 🟡 BUG: Card uses full border instead of 3px top-only with shadow-card
- **Location:** src/components/packages/package-card.tsx:54-60
- **Actual:** Applies `border border-edge border-t-[3px]` plus omits `shadow-[var(--shadow-card)]`.

### ⚪ NOTE: Stat label tracking drift (0.5px vs spec 2px)
- **Location:** src/components/packages/package-card.tsx:95-99, 103-107

### ⚪ NOTE: Page heading uses 20/24px responsive, spec page titles are 24px
- **Location:** src/app/(dashboard)/packages/page.tsx:50-52

### ⚪ NOTE: API route returns flat LessonPackage rows with no module/lesson counts
- **Location:** src/app/api/packages/route.ts:11-16

### ⚪ NOTE: Tier mapping table duplicates level + tier keys
- **Location:** src/components/packages/package-card.tsx:21-46

### ⚪ NOTE: `description` optional in prop type but seed always provides one
- **Location:** src/components/packages/package-card.tsx:14

## 13. Hardware (Kits + Assignments)

Scope: hardware/page.tsx, api/hardware/route.ts, api/hardware/assign/route.ts, hardware-actions.ts, kit-card.tsx, assign-kit-modal.tsx.

### P0 — POST /api/hardware/assign lacks Zod validation and kit/user existence check
File: `src/app/api/hardware/assign/route.ts` (lines 16–24, 49–54). Reads `kitId`/`userId` directly with no schema, no type check, no verification user exists. Malformed input throws Prisma FK 500. Also no check for active duplicate assignment — server action `assignKit` guards but route does not.

### P0 — `@@unique([kitId, userId])` conflicts with "return then re-assign" lifecycle
File: `prisma/schema.prisma` HardwareAssignment. Both API route and `assignKit` create a new row on every assignment. After `returnKit` sets `returnedAt`, the row persists — next `assignKit` for the same (kit, user) pair fails with P2002. Either drop the composite unique or upsert/reactivate.

### P1 — Hardware page performs role gating with `redirect`, diverges from `requireRole` pattern
File: `src/app/(dashboard)/hardware/page.tsx` lines 6–9. Uses denylist (`if (user.role === "STUDENT") redirect`) instead of allowlist `requireRole(["TEACHER","ADMIN"])`.

### P1 — `assign-kit-modal.tsx` is orphaned; page flow uses a different component
File: `src/components/hardware/assign-kit-modal.tsx` vs `hardware-client.tsx` line 9 (imports `AssignKitTrigger`).

### P1 — GET /api/hardware returns `_count.assignments` but page bypasses the API entirely
File: `src/app/api/hardware/route.ts` lines 16–26; `src/app/(dashboard)/hardware/page.tsx` lines 11–19.

### P1 — `returnKit` action has no ownership/scoping check
File: `src/actions/hardware-actions.ts` lines 42–62. Any teacher can return any assignment org-wide.

### P1 — `createKit` / `updateKit` bypass Zod entirely and cast `level` with `as any`
File: `src/actions/hardware-actions.ts` lines 64–112. No enum validation, `Number("")` → 0, `Number("abc")` → NaN. `updateKit` does not prevent `totalQty` from being reduced below current active assignment count.

### P2 — `KitCard` allows negative `available`
File: `src/components/hardware/kit-card.tsx` lines 22, 67. Suggest `Math.max(0, ...)`.

### P2 — `LevelBadge` receives a raw string from Prisma enum
File: `src/components/hardware/kit-card.tsx` line 36.

### P2 — AssignKitModal's student list is unfiltered for availability/duplicates
File: `src/components/hardware/assign-kit-modal.tsx` lines 97–108.

### P2 — AssignKitModal assumes `error` is a string in one branch
File: `src/components/hardware/assign-kit-modal.tsx` lines 51–53.

### P2 — Spec wording: font role for specs/stat numbers (matches spec, noted for coverage)

### P3 — No `dynamic = "force-dynamic"` or caching hint
### P3 — `assignKit` server action returns `assignmentId` but modal ignores it
### P3 — Emoji input validation missing in createKit

## 14. Users (Admin)

### 🟡 M1 — Admin can demote/lock themselves out
`PATCH /api/users/[userId]` and `updateUser` server action perform admin checks but neither prevents an admin from changing their own role away from ADMIN. If the only admin demotes themselves, system is left without admin access.

### 🟡 M2 — `updateUser` server action writes empty-string department silently
src/actions/user-actions.ts:14-19. `formData.get("department")` returns `""` when present and empty; `?? undefined` only collapses null/undefined. Clearing the field writes `""` to DB.

### 🟡 M3 — No way to clear a user's `schoolLevel` from the UI
edit-user-modal.tsx:42-44. Selecting "— None —" omits the field; no path to set `schoolLevel = null`.

### 🟡 M4 — `GET /api/users` passes `role` query param straight to Prisma
src/app/api/users/route.ts:21-23. Unvalidated; bad enum → Prisma 500 instead of 400. Also no pagination.

### 🔵 L1 — Page bypasses `/api/users` entirely
Two sources of truth.

### 🔵 L2 — `updateUserSchema.department` has no length bound
src/lib/validations.ts:66.

### 🔵 L3 — Modal doesn't refresh server data on success
EditUserModal.handleSave never calls `router.refresh()`.

### 🔵 L4 — Modal cannot edit `name` despite schema allowing it

### ⚪ N1 — `role` cast in page.tsx is redundant
### ⚪ N2 — `updateUser` revalidates a non-existent path (`/users/${userId}`)
### ⚪ N3 — Client filter uses `role.toLowerCase().includes(q)`

## 15. Settings (Profile + Password)

### P1 — Profile and password server actions bypass Zod validation entirely
File: `src/actions/settings-actions.ts` lines 8–28 (`updateProfile`), lines 30–65 (`changePassword`). No schemas in `validations.ts`; hand-rolled checks. `updateProfile` only checks `name.length >= 2`, no max length, department unbounded. `changePassword` checks presence + min 6 + match, but does not enforce `new !== current`, no max, no whitespace rejection.

### P1 — `department` field for profile is editable by students, but students don't use department
The spec lists "name, email, department" for all users, but only TEACHER has department in seed; students use `schoolLevel`. Settings exposes department to all but never exposes `schoolLevel` editing. Students can edit a meaningless field; the field that matters is hidden.

### P1 — Name change does not refresh the JWT session; sidebar/topbar keep stale name
JWT token populated once on sign-in. Subsequent renders keep pre-change name. Need `auth.update(...)` or layout revalidation.

### P1 — `updateProfile` does not revalidate the layout, so the sidebar user block stays stale
File: `src/actions/settings-actions.ts` line 26. `revalidatePath("/settings")` only invalidates the settings page; layout caches `getCurrentUser()` result.

### P2 — Password change does not invalidate other sessions or log the user out
### P2 — No rate limiting on `changePassword`; current-password check is an oracle
### P2 — Email field is `disabled` + `readOnly` with no server-side comment
### P2 — `changePassword` returns `{ success: true }` but does not `revalidatePath`
### P2 — Client form handles pending state manually instead of using `useActionState` / `useFormStatus`
### P2 — `useUnsavedChanges` considers a filled-in current-password field as "dirty"
### P2 — Toasts not cleared on unmount; no aria-live region verified

### P3 — Page-level auth check duplicates middleware
### P3 — `initialDepartment` falls back to empty string, losing null semantics
### P3 — No max-width on the Name / Department inputs beyond the container's `max-w-2xl`
### P3 — Settings page has `loading.tsx` (noted for completeness)

**Positive findings:** Both actions begin with `requireAuth()` and only ever write `where: { id: sessionUser.id }` — no privilege escalation. `changePassword` correctly verifies current with `bcrypt.compare` and hashes with cost 12, parity with register. Email is not accepted by `updateProfile` at all.

## 16. Announcements

### 🔴 HIGH — No Zod validation on `POST /api/announcements`
`src/app/api/announcements/route.ts:32-40` destructures `title`, `content`, `priority` directly with only truthiness checks. `priority` accepts arbitrary strings, no length bounds on title/content. Server action correctly uses Zod — inconsistency between two write paths. Fix: extract `createAnnouncementSchema` and share.

### 🟡 MEDIUM — `GET /api/announcements` has no ordering limit or pagination
`route.ts:11-16` fetches every announcement with `include: author`. Unbounded firehose.

### 🟡 MEDIUM — Dashboard bypasses the API and server action entirely
`dashboard/page.tsx:176-186` calls `prisma.announcement.findMany` directly. The `GET` route's `include: { author }` shape is unused.

### 🟡 MEDIUM — `priority` is an untyped `String` in Prisma
`prisma/schema.prisma` models `priority String @default("normal")`. Should be a Prisma enum.

### 🟢 LOW — Missing `updatedAt` / edit + delete surfaces
### 🟢 LOW — `relativeTime()` uses client-side `new Date()` inside an RSC
### 🟢 LOW — No priority ordering, only `createdAt desc`
### 🟢 LOW — Badge variant coverage incomplete (low and normal collapse)

### ⚪ NOTE — No UI for creating announcements
No page, modal, or form invokes `createAnnouncement`. Teachers and admins have no way to create announcements through the app.

### ⚪ NOTE — `createAnnouncement` server action only revalidates `/dashboard`

## 17. Cross-cutting Concerns

### Summary
The codebase is largely compliant with Next.js 16 mandates. All 13 dynamic route files type `params` as `Promise<...>` and no sync access was found. No uses of `cookies()`, `headers()`, `draftMode()`, `legacyBehavior`, `"use cache"`, `force-static`, or `revalidate` exist anywhere under `src/`. All React-hook-using files carry `"use client"`; all `@/lib/prisma` imports live in server files.

### [LOW] Middleware and layout reference `icon.svg` while CLAUDE.md spec says `logo.svg`
- `src/middleware.ts:34` — matcher excludes `icon.svg`
- `src/app/layout.tsx:30-32` — `icons: { icon: "/icon.svg", apple: "/icon.svg" }`
- `public/` contains `icon.svg` (no `logo.svg`)

### [LOW] Middleware uses `getToken` directly instead of `auth()` wrapper
`src/middleware.ts:1-7`. Works (JWT session strategy is configured) and avoids pulling Prisma into edge runtime, but deviates from documented pattern.

### [LOW] Dead file: `src/hooks/use-current-user.ts`
Declared and marked `"use client"` but zero importers anywhere in `src/`.

### [LOW] Spec component files missing: `mobile-nav.tsx`
`src/components/layout/` has only `sidebar.tsx`, `topbar.tsx`. Mobile nav logic folded into `sidebar.tsx`. Functionally equivalent but structurally collapsed.

### [INFO] Landing page matches spec
### [INFO] Sidebar nav items all resolve to real pages
### [INFO] Server/client boundary is clean
### [INFO] No legacy Next.js patterns present

## 18. Mobile Spot-Check

### ⚪ NOTE: Mobile spot-check deferred to runtime audit
Not exercised — this audit run is code-only. Static review confirms a single sidebar component handles both desktop and mobile via responsive classes; spec'd standalone `mobile-nav.tsx` not found (logged in fragment 17). All other responsive concerns require live measurement.

## Coverage Appendix

Legend: ✓ audited, no role-specific finding · ⚠ audited, has finding affecting that role · 🚫 not applicable / blocked by design.

### Pages

| Route | Student | Teacher | Admin |
|---|---|---|---|
| `/` | ✓ | ✓ | ✓ |
| `/login` | ⚠ | ⚠ | ⚠ |
| `/register` | ⚠ | ⚠ | 🚫 |
| `/dashboard` | ⚠ | ⚠ | ⚠ |
| `/courses` | ⚠ | ⚠ | ⚠ |
| `/courses/new` | 🚫 | ⚠ | ⚠ |
| `/courses/[courseId]` | ⚠ | ⚠ | ⚠ |
| `/courses/[courseId]/edit` | 🚫 | ⚠ | ⚠ |
| `/lessons/[lessonId]` | ⚠ | ✓ | ⚠ |
| `/tasks` | ⚠ | ⚠ | ⚠ |
| `/tasks/[taskId]` | ⚠ | ⚠ | ⚠ |
| `/grades` | ✓ | ⚠ | ⚠ |
| `/calendar` | ⚠ | ⚠ | ⚠ |
| `/packages` | ⚠ | ⚠ | ⚠ |
| `/hardware` | 🚫 | ⚠ | ⚠ |
| `/users` | 🚫 | 🚫 | ⚠ |
| `/settings` | ⚠ | ⚠ | ⚠ |

### API routes

| Route | Methods | Audited |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | ✓ |
| `/api/auth/register` | POST | ⚠ |
| `/api/courses` | GET/POST | ⚠ |
| `/api/courses/[courseId]` | GET/PATCH/DELETE | ⚠ |
| `/api/courses/[courseId]/enroll` | POST | ✓ |
| `/api/courses/[courseId]/modules` | POST | ✓ |
| `/api/modules/[moduleId]` | PATCH/DELETE | ⚠ |
| `/api/modules/[moduleId]/lessons` | POST | ✓ |
| `/api/lessons/[lessonId]` | GET/PATCH | ⚠ |
| `/api/tasks` | GET/POST | ⚠ |
| `/api/tasks/[taskId]` | GET | ⚠ |
| `/api/tasks/[taskId]/grade` | PATCH | ⚠ |
| `/api/packages` | GET | ⚠ |
| `/api/hardware` | GET | ⚠ |
| `/api/hardware/assign` | POST | ⚠ |
| `/api/users` | GET | ⚠ |
| `/api/users/[userId]` | PATCH | ⚠ |
| `/api/calendar` | GET/POST | ⚠ |
| `/api/announcements` | GET/POST | ⚠ |

### Files-not-touched

- `src/app/api/uploadthing/core.ts`, `src/app/api/uploadthing/route.ts` — out of scope; no fragment dedicated to upload pipeline.
- UI primitives under `src/components/ui/` — referenced transitively but not individually inspected.
- `src/lib/uploadthing.ts` — companion to uploadthing API.
- `src/components/hardware/kit-form-modal.tsx`, `assign-kit-trigger.tsx`, `hardware-client.tsx` — touched in passing by fragment 13 but not full-file audited.
- Mobile runtime sweep (fragment 18) — deferred per code-only fallback (spec §3).

## Environment Notes

# Environment Notes (working file — folded into final report)

## Dev environment
- DATABASE_URL: present (Supabase pooled PostgreSQL)
- AUTH_SECRET: present
- Migrations: up-to-date (1 migration applied; "Database schema is up to date!")
- `npm run dev` boot: not exercised — auditor lacks browser interaction capability
- Home page response: not measured

## Demo accounts (from prisma/seed.ts)
- Teacher: elena@proxima.edu / password123
- Students: marcus@student.proxima.edu, aisha@student.proxima.edu, jake@student.proxima.edu / password123
- Admin: admin@proxima.edu / password123

## Phase 2 strategy
- **Code-only fallback** (per spec §3) — runtime browser checks are out of scope for this audit run.
  Auditor cannot drive a browser, click through modals, observe hydration warnings, or verify Monaco
  mounting at runtime. All findings derived from static code review of the existing implementation
  against `CLAUDE.md`. Items that would require runtime verification are surfaced as ⚪ NOTE
  ("requires runtime verification") rather than dropped silently.

## Notes
- Prisma version 6.19.2 (warning: 7.7.0 available; not blocking).
- `package.json#prisma` config key is deprecated in Prisma 7 — pre-existing, unrelated to audit scope.
