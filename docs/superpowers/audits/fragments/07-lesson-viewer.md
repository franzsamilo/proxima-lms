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
- **Notes:** Add an enrollment lookup (or instructor/admin shortcut) before the lesson fetch and `notFound()` / `forbidden()` on failure.

### 🟡 BUG: Quiz submit allows incomplete answer sets
- **Feature:** Lesson Viewer — quiz
- **Location:** src/components/lessons/quiz-renderer.tsx:162
- **Roles affected:** STUDENT
- **Expected:** A quiz submission should require an answer for every question.
- **Actual:** The submit guard only checks `Object.keys(answers).length < questions.length`, but `answers` is keyed by question id; if a student answers Q1 then deselects, the count math can permit a sparse submission. Even at face value, the validation gate is shown only by disabling the button — there is no guard on the submit handler itself.
- **Notes:** Add a hard validation in the submit handler and surface a per-question error if anything is unanswered.

### 🔵 POLISH: Monaco theme registered after mount, causing first-paint flash
- **Feature:** Lesson Viewer — code editor
- **Location:** src/components/lessons/code-editor.tsx:98-107
- **Roles affected:** ALL
- **Expected:** Editor renders in the customized dark theme on first paint.
- **Actual:** Theme is defined and applied inside `onMount`, so the editor briefly shows the default `vs-dark` palette before switching. Cosmetic.

### ⚪ NOTE: Hydration / Monaco runtime behavior
- **Feature:** Lesson Viewer
- **Location:** runtime
- **Notes:** Confirming "no hydration warnings", "Monaco mounts cleanly", "quiz round-trips a submission", and "video player plays" requires a real browser session — deferred per code-only audit fallback.

---

**Coverage:** code-audited src/app/(dashboard)/lessons/[lessonId]/page.tsx, src/app/api/lessons/[lessonId]/route.ts, slide-viewer.tsx, code-editor.tsx, quiz-renderer.tsx, task-submission.tsx. Async params awaited. Type-based component switch verified. All viewers carry `"use client"`. Runtime checks deferred.
