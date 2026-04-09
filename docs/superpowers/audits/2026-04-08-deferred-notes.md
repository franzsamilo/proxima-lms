# Deferred Audit ⚪ NOTES — 2026-04-08

These findings from the 2026-04-08 E2E audit were intentionally NOT closed by
the fix-pass on `fix/e2e-audit-cleanup`. They are tracked here for a future
runtime/refactor pass.

| # | Fragment | Title | Reason for deferral |
|---|---|---|---|
| 1 | 02-auth | PrismaAdapter cast-to-any | Cosmetic; type works at runtime. Low risk. |
| 2 | 02-auth | Next.js 16 searchParams not awaited in login page | Actually correct for client components — no fix needed. |
| 3 | 03-dashboard | Announcements/Events fetched in layout (non-blocking pattern) | Informational; architectural pattern is defensible. |
| 4 | 04-courses-read | Hydration / async params behavior at runtime | Requires runtime verification; code-only audit cannot confirm. |
| 5 | 05-courses-write | Date transformation via createCourseSchema | Schema transforms match spec; working as intended. |
| 6 | 06-modules-lessons | Module/lesson creation UI exists in edit page only | Spec does not strictly require inline creation on read page; informational. |
| 7 | 07-lesson-viewer | Hydration / Monaco runtime behavior | Requires browser session to verify Monaco mount, hydration, quiz round-trip, video playback. |
| 8 | 08-tasks | `submitTaskSchema.quizAnswers` uses `z.record(z.string(), z.string())` two-arg form | Zod v4 style; works with current lockfile but needs runtime verification if pinned to v3. |
| 9 | 08-tasks | Page loader uses its own query instead of `GET /api/tasks` (two sources of truth) | Architectural; page and API have divergent filters. Needs broader refactor. |
| 10 | 08-tasks | Runtime checks deferred | Interactive verification of tab filtering, re-submission, viewer rendering requires running dev server. |
| 11 | 09-grading | Form does not surface field-level Zod errors | Cosmetic; HTML5 min/max/required prevents most cases. |
| 12 | 09-grading | Empty feedback string is persisted instead of null | Data hygiene nit; benign in practice. |
| 13 | 10-grades | `getGradeColor`/`getGradeBgColor`/`getGradeLabel` helpers in utils.ts use hardcoded Tailwind classes vs design-system tokens | Dead helpers; GradeCircle correctly uses semantic tokens. Cleanup deferred. |
| 14 | 10-grades | Spec-conformant items observed (GradeCircle thresholds, tokens) | Informational coverage note. |
| 15 | 11-calendar | Calendar grid "today" detection uses client clock only | Client-only component; SSR/CSR mismatch not possible. Awareness note. |
| 16 | 11-calendar | Badge variant for `event` uses `info` but spec specifies dot color `signal` | Minor visual inconsistency between event list badge and grid dot. |
| 17 | 11-calendar | Empty `courseIds` in `{in: []}` returns zero course-scoped events | Benign defensive case; session.user.role is always defined via JWT callback. |
| 18 | 11-calendar | All client components correctly marked `"use client"` | Informational. |
| 19 | 11-calendar | No dynamic route params in calendar area | Informational; async-params N/A. |
| 20 | 11-calendar | Grid structure matches spec | Informational. |
| 21 | 12-packages | Stat value typography 20px vs spec 20px but weight/tracking drift | Minor polish; functionally correct. |
| 22 | 12-packages | Page heading uses 20/24px, spec page titles are 24px (Syne 700, tracking-tight) | Responsive shrink is a reasonable deviation. |
| 23 | 12-packages | Package query fetches nested module/lesson IDs twice (page) while API route omits counts | Not a bug for SSR page; API is intentionally flat or incomplete. |
| 24 | 12-packages | Tier mapping table duplicates level + tier keys | Defensive duplication works; low priority cleanup. |
| 25 | 12-packages | `description` optional in prop type but seed always provides one | Type is wider than needed; acceptable. |
| 26 | 13-hardware | No `dynamic = "force-dynamic"` or caching hint | Next.js 16 is dynamic by default; no `"use cache"` present. Fine. |
| 27 | 13-hardware | `assignKit` server action returns `assignmentId` but modal ignores it | Benign; future cleanup. |
| 28 | 13-hardware | Emoji input validation missing in createKit | Low risk; field only shown on card. |
| 29 | 14-users | `role` cast in page.tsx is redundant | Cosmetic; no runtime impact. |
| 30 | 14-users | `updateUser` revalidates a non-existent path | Harmless no-op; should clean up. |
| 31 | 14-users | Client filter uses `role.toLowerCase().includes(q)` | Works for current enum values; slightly fragile. |
| 32 | 15-settings | Session invalidation post password change | JWT strategy has no DB session to delete; requires `passwordChangedAt` + jwt callback check or client-side signOut. Deferred to security hardening pass. |
| 33 | 15-settings | Rate limiting on changePassword | Requires server-side rate limiter (in-memory or DB-backed); out of scope for audit fix-pass. |
| 34 | 15-settings | Page-level auth check duplicates middleware | Belt-and-suspenders; intentional redundancy. |
| 35 | 15-settings | `initialDepartment` falls back to empty string, losing null semantics | Round-trip is lossless (empty → null on save). Nit. |
| 36 | 15-settings | No max-width on Name/Department inputs beyond container's `max-w-2xl` | Cosmetic; consistent with other forms. |
| 37 | 15-settings | Settings page has `loading.tsx` — noted for completeness | Informational. |
| 38 | 16-announcements | No UI for creating announcements | API + server action exist; UI not yet built. Feature gap, not a bug. |
| 39 | 16-announcements | `createAnnouncement` server action only revalidates `/dashboard` | Should also revalidate announcements list if one is added. Minor. |
| 40 | 17-cross-cutting | Mobile nav logic folded into sidebar.tsx vs spec's three-file layout | Functionally equivalent; structural refactor deferred. |
| 41 | 17-cross-cutting | Landing page matches spec | Informational. |
| 42 | 17-cross-cutting | Sidebar nav items all resolve to real pages | Informational. |
| 43 | 17-cross-cutting | Server/client boundary is clean | Informational. |
| 44 | 17-cross-cutting | No legacy Next.js patterns present | Informational. |
| 45 | 18-mobile | Mobile spot-check deferred to runtime audit | Requires 375x812 viewport testing in browser. |
