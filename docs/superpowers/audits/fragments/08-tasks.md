## 8. Submissions & Tasks list/detail
**What it should do:** Role-scoped task list and detail views for student submissions, with grade display and status tabs (All / Pending / Graded), plus code viewer, video player, and quiz answer renderer.

### 🟡 BUG — Tasks list hides DRAFT submissions for students
- **Feature:** Tasks list
- **Location:** src/app/(dashboard)/tasks/page.tsx:28, 43, 53
- **Roles affected:** STUDENT
- **Expected (per CLAUDE.md):** `GET /api/tasks` returns "Students: their submissions" with no qualifier. A student's in-progress drafts should be visible so they can resume or re-submit.
- **Actual:** The page-level data loader hardcodes `status: { not: "DRAFT" }` for all roles, so a student who has started a task (Submission created in DRAFT via `saveDraft`/initial row) never sees it in /tasks. There is also no way to reach the draft from this page to continue editing.
- **Repro:** As a student, create a DRAFT submission (e.g. via task submission "Save Draft"), then navigate to /tasks — the draft row is absent.
- **Notes:** The companion `GET /api/tasks` route (route.ts) does NOT apply this filter, so the API and the page disagree on what "tasks" means.

### 🟡 BUG — Tasks page ignores spec'd `?status=` and tab filters server-side; no All/Pending/Graded tabs on server
- **Feature:** Tasks list tabs
- **Location:** src/app/(dashboard)/tasks/page.tsx:59-86
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** "Tabs: All / Pending / Graded." Tasks page should support filtering by status.
- **Actual:** The server page fetches all submissions and delegates to `<TasksClient>` (not in audit scope) without reading `searchParams`. No `props.searchParams` is awaited. If tabs exist they are client-only filters; URL-shareable/bookmarkable tab state is not supported and there is no server-side `?status=` pass-through.
- **Repro:** Visit /tasks?status=GRADED — URL param is ignored by the page loader.

### 🟡 BUG — `GET /api/tasks` status filter is unvalidated and accepts arbitrary strings
- **Feature:** Tasks API list
- **Location:** src/app/api/tasks/route.ts:14-21
- **Roles affected:** ALL
- **Expected:** `?status=` should be constrained to `SubmissionStatus` enum values (DRAFT|SUBMITTED|GRADED|RETURNED).
- **Actual:** `where.status = status` assigns the raw query string. A garbage value like `?status=FOO` will reach Prisma and throw a 500 (PrismaClientValidationError) rather than a clean 400.
- **Repro:** `curl /api/tasks?status=FOO` → 500 instead of 400.

### 🟡 BUG — Admin-only courseId filter in `GET /api/tasks` silently ignores non-admin scoping
- **Feature:** Tasks API list
- **Location:** src/app/api/tasks/route.ts:36-43
- **Roles affected:** ADMIN
- **Expected:** Admin sees "all" with `?courseId=` narrowing. The `else if (courseId)` branch must run regardless of role; currently it only fires if the role is neither STUDENT nor TEACHER AND courseId is set.
- **Actual:** If role is ADMIN and no courseId is passed, the `where` clause has no scoping (correct). But if role is something unexpected (e.g. undefined token) the clause also falls into the admin branch — there is no explicit ADMIN check, so any non-STUDENT/non-TEACHER role is treated as admin. Combined with an absent role claim this is an authorization widening risk.
- **Notes:** Prefer explicit `else if (userRole === "ADMIN")` with a 403 fallback.

### 🟡 BUG — `GET /api/tasks` ordering differs from page loader (createdAt vs submittedAt)
- **Feature:** Tasks API list
- **Location:** src/app/api/tasks/route.ts:51 vs src/app/(dashboard)/tasks/page.tsx:29
- **Roles affected:** ALL
- **Expected:** Consistent ordering. Spec implies "Submitted" column sort relevance; user-facing should be `submittedAt desc`.
- **Actual:** API orders by `createdAt`, page loader orders by `submittedAt`. Two consumers of the same data will show different orders.

### 🟡 BUG — `POST /api/tasks` upsert accepts `videoUrl`/`fileUrl` for any lesson type and does not enforce lesson-type→field mapping
- **Feature:** Task submission API (out of scope but same file)
- **Location:** src/app/api/tasks/route.ts:101-126
- **Roles affected:** STUDENT
- **Expected:** A CODE lesson submission should carry codeContent; a VIDEO lesson should carry videoUrl, etc. (Spec implies per-type submission content.)
- **Actual:** The schema and upsert accept any/all fields regardless of the lesson's type. A student can submit a VIDEO lesson with only codeContent or an empty body.
- **Notes:** Lower priority since the reference spec only lists field-level validation; flagged for grading/viewer consistency. Mentioned for context because the viewer (`task-detail.tsx`) falls through to "No submission content available" when field↔type don't match.

### 🟡 BUG — `POST /api/tasks` upsert on a GRADED/RETURNED submission silently overwrites grade state without touching `grade`/`gradedAt`
- **Feature:** Task submission API
- **Location:** src/app/api/tasks/route.ts:101-126
- **Roles affected:** STUDENT, TEACHER
- **Expected:** Re-submitting after grading should either be blocked, or should reset grade/gradedAt/feedback so the stale grade is not retained. Spec says upsert sets `status: SUBMITTED`, `submittedAt: now()` — implying a fresh cycle.
- **Actual:** Update block sets status back to SUBMITTED but leaves `grade`, `gradedAt`, `feedback` from the prior grading cycle. The student now has a SUBMITTED row with a stale grade still attached; the task-detail viewer shows the old grade card alongside the new submission.
- **Repro:** Grade a submission → student re-submits same lesson → /tasks/[taskId] still shows the previous grade.

### 🟡 BUG — `GET /api/tasks/[taskId]` has no `?courseId=` irrelevant but lacks ADMIN explicit check and permits any authenticated non-TEACHER/non-STUDENT role
- **Feature:** Task detail API authorization
- **Location:** src/app/api/tasks/[taskId]/route.ts:33-46
- **Roles affected:** ADMIN (and any unexpected role)
- **Expected:** "Owner/instructor/admin only."
- **Actual:** Only STUDENT and TEACHER branches are checked. Any other role value (e.g. a future role, a malformed JWT with a non-enum role) falls through to the success path. Should explicitly allow only `ADMIN` as the fallback.

### 🟡 BUG — `task-detail.tsx` uses `lesson.type === "CODE"` but CODE lessons and TASK lessons both submit code
- **Feature:** Task detail viewer
- **Location:** src/components/tasks/task-detail.tsx:100-128
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** TASK lessons submit "code/video upload" (`task-submission.tsx` supports both). The viewer should render codeContent/videoUrl for TASK type as well.
- **Actual:** The branch ladder only shows code for `CODE`, video for `VIDEO`, quiz for `QUIZ`. A TASK submission that contains codeContent AND videoUrl (per the Line Following Challenge seed) falls through to `fileUrl` (also null), then to "No submission content available." The seeded line-following submission (l6, video-only) will actually hit the fallback too, since `type === "TASK"` and none of the branches match.
- **Repro:** Open /tasks/[id] for the seeded Line Following submission — the viewer shows "No submission content available" despite having a videoUrl.
- **Notes:** This is a correctness blocker for the seed data specifically, so arguably 🔴 BLOCKER for demo flows. Listed as 🟡 because the fix is a small condition change.

### 🔵 POLISH — CodeViewer is not marked `"use client"` but works as server; loses language tag label
- **Feature:** Code viewer styling
- **Location:** src/components/tasks/code-viewer.tsx:1-50
- **Roles affected:** ALL
- **Expected:** CLAUDE.md spec says "Background #0D1117, JetBrains Mono 13px weight-400, line-height 1.7, color #C9D1D9, overflow-x auto, white-space pre-wrap" — all correct.
- **Actual:** Styling matches spec. However, `task-detail.tsx` passes `language="code"` which renders a literal "CODE" uppercase label instead of a real language (e.g. "python"). Cosmetic mismatch; consider passing the actual language or omitting.

### 🔵 POLISH — Task table "Grade" column shows em-dash for SUBMITTED rows with no visual distinction from ungraded
- **Feature:** Task table
- **Location:** src/components/tasks/task-table.tsx:63-67, 129-134
- **Roles affected:** ALL
- **Expected:** Spec column "Grade" — implied to show grade for GRADED, and a clear pending indicator otherwise.
- **Actual:** Em-dash works but a "Pending" label in `ink-ghost` might read better; minor.

### 🔵 POLISH — Task table missing a "Course" column on teacher view
- **Feature:** Task table
- **Location:** src/components/tasks/task-table.tsx:86-97
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md spec):** "Task, Student (teacher), Type, Status, Submitted, Grade". The spec omits Course, so strictly this is compliant.
- **Actual:** For teachers with multiple courses, the lack of a course column hampers triage. Flagged as polish/ergonomic improvement only; not a spec violation.

### 🔵 POLISH — Inline style objects instead of Tailwind in code-viewer / video-player
- **Feature:** Component styling consistency
- **Location:** src/components/tasks/code-viewer.tsx:10-47, src/components/tasks/video-player.tsx:12-28
- **Roles affected:** ALL
- **Expected:** Project uses Tailwind 4 + `@theme`. Other components in `components/tasks` use className-based styling.
- **Actual:** Both files use inline `style={{ ... }}` with CSS variables, which works but diverges from the convention and loses Tailwind's responsive/hover/focus classes.

### 🔵 POLISH — Video player lacks poster, preload, and accessibility title/captions
- **Feature:** Video player
- **Location:** src/components/tasks/video-player.tsx:20-32
- **Roles affected:** ALL
- **Expected:** Accessible video demo review.
- **Actual:** No `preload="metadata"`, no `poster`, no `<track>` captions. Minor a11y improvement.

### ⚪ NOTE — `submitTaskSchema.quizAnswers` uses `z.record(z.string(), z.string())` with two args
- **Feature:** Schema
- **Location:** src/lib/validations.ts:47
- **Roles affected:** N/A
- **Notes:** Zod v3 `z.record` takes a single value type; the two-arg form is Zod v4 style. Works with `zod@4` but if the project lockfile pins `zod@3` this will throw at module load. Runtime verification deferred.

### ⚪ NOTE — Page loader uses its own query instead of `GET /api/tasks` (two sources of truth)
- **Feature:** Tasks list data layer
- **Location:** src/app/(dashboard)/tasks/page.tsx:7-57 vs src/app/api/tasks/route.ts
- **Roles affected:** ALL
- **Notes:** Page fetches directly via Prisma and applies different filtering/ordering than the public API. Any fix in one place must be mirrored in the other; the listed findings (DRAFT filter, ordering, status validation) are cases where drift is already observable.

### ⚪ NOTE — Runtime checks deferred
- **Feature:** End-to-end verification
- **Roles affected:** ALL
- **Notes:** Interactive verification of tab filtering, re-submission after grading, Line Following viewer rendering, and 500 vs 400 error responses requires a running dev server and seeded DB; code-only fallback used.

**Coverage:** src/app/(dashboard)/tasks/page.tsx, src/app/(dashboard)/tasks/[taskId]/page.tsx, src/app/api/tasks/route.ts, src/app/api/tasks/[taskId]/route.ts, src/actions/task-actions.ts, src/components/tasks/task-table.tsx, src/components/tasks/task-detail.tsx, src/components/tasks/code-viewer.tsx, src/components/tasks/video-player.tsx, src/lib/validations.ts (submitTaskSchema). Runtime checks deferred (code-only fallback).
