# E2E Audit Design — Proxima LMS

**Date:** 2026-04-08
**Status:** Approved (brainstorming)
**Owner:** franzsamilo
**Output artifact:** `docs/superpowers/audits/2026-04-08-e2e-audit-report.md`

---

## 1. Goal

Produce a single markdown report listing every place the Proxima LMS does not behave the way `CLAUDE.md` says it should. The report must be detailed enough that a later fix-pass can work the list without re-investigating each item.

This audit is the first of two planned tracks. The second — a UI "de-templatification" pass — runs only after the bugs found here have been fixed, so the redesign sits on a known-good base.

---

## 2. Scope

### In scope

- Every feature/capability described in `CLAUDE.md`, exercised across all three roles (`STUDENT`, `TEACHER`, `ADMIN`).
- **Code-level audit** of: pages, layouts, server actions, API routes, middleware, auth helpers, Zod validations, Prisma queries.
- **Runtime spot-checks** for behaviors the code audit cannot verify: Monaco editor, file/video uploads, quiz round-trip, hydration, modal/accordion interactions, toasts.
- **Mobile spot-checks** at <768px on each route, looking only for layout regressions (overflow, unreachable controls, missing hamburger). Recent mobile-responsiveness work is the baseline; this is regression hunting, not full mobile QA.

### Out of scope

- Fixing anything. This is a **report-only** pass. Fixes are a separate spec.
- Performance / perf budgets.
- Accessibility audit.
- The UI redesign / de-templatification track.
- Adding test infrastructure (no Playwright, no Vitest setup as part of this work).
- Security auditing beyond verifying that auth is enforced where `CLAUDE.md` says it is.

### Non-goals worth naming

- We are **not** trying to produce a passing test suite.
- We are **not** trying to make the report a tutorial — it's a fix-list, not documentation.
- We are **not** scoring code quality/style. Spec mismatches only.

---

## 3. Methodology

### Phase 1 — Code audit (~80% of effort)

For each feature in the inventory (§4), read the relevant files in this order:

1. **Spec.** What does `CLAUDE.md` say this feature does? Note expected behavior.
2. **Server action / API route.** Does the mutation match the spec? Is the auth check present and correct? Is Zod validation applied? Are Prisma calls correct? Is `revalidatePath` called where the spec implies cache invalidation?
3. **Page / component.** Does it call the right action? Are async `params` / `searchParams` / `cookies()` / `headers()` awaited (Next.js 16 requirement)? Do props match? Are loading and error states present where the spec calls for them? Are buttons actually wired to handlers, or are they decorative?
4. **Cross-references.** Do the linked-from pages actually link to the linked-to pages? Any dead links, orphaned routes, or routes missing from the sidebar nav?

Findings are recorded as I go. **No code is changed during Phase 1.**

### Phase 2 — Runtime spot-checks (~20% of effort)

Start the dev server against the seeded database. Sign in as each demo account (`elena@proxima.edu`, `marcus@student.proxima.edu`, `admin@proxima.edu`). Verify the items code review cannot answer:

- Monaco editor mounts, accepts input, and the value reaches the submission action.
- Quiz answers round-trip through the submission (selection → DB → re-render).
- Uploadthing file/video upload either succeeds or fails gracefully when credentials are missing.
- Forms submit without hydration errors in the console.
- Module accordion expand/collapse, sidebar collapse, modal open/close, toast appearance.
- Mobile spot-check at 375px on each route: hamburger reachable, no horizontal scroll, no clipped buttons.

Runtime is **manual through the browser** — no Playwright is added. If the dev server cannot start (DB down, missing env vars, build error), that itself becomes a 🔴 BLOCKER finding and Phase 2 falls back to code-only with the limitation noted in the report's Environment section.

### Why this split

Code audit catches the majority of "feature does not do what the spec says" issues at high speed and with full traceability (file:line). Runtime catches the residue — anything that compiles cleanly but breaks in the browser. Trying to do everything via runtime would be slow and would miss server-side bugs that don't surface until a specific role hits a specific action.

---

## 4. Feature Inventory

The audit walks these features in execution order. Each becomes a section in the final report.

1. **Auth & Session** — login, register, logout, middleware redirects, role gating, JWT shape, password hashing, redirect-after-login.
2. **Dashboard** — role-adaptive stats grid, announcements panel, recent activity, upcoming events.
3. **Courses (Read)** — list page, level/search filters, role visibility (students see enrolled, teachers see taught, admins see all), course detail with nested modules → lessons.
4. **Courses (Write)** — create, edit, delete, enrollment endpoint, `maxStudents` enforcement, cascade behavior on delete.
5. **Modules & Lessons (Write)** — create module, create lesson, auto-`order`, cascade on module/course delete.
6. **Lesson Viewer** — `SLIDES` (react-markdown), `CODE` (Monaco), `QUIZ` (radio + scoring), `TASK` (submission form), `VIDEO` (player). Per-type rendering and per-type submission shape.
7. **Submissions & Tasks** — submit endpoint, list (student vs. teacher view differs), filter by status / course, detail page.
8. **Grading** — grade form, validation (`gradeTaskSchema`), status transition to `GRADED`, `gradedAt` set, feedback persistence.
9. **Grades page** — summary cards per course, full grade table, distribution chart.
10. **Calendar** — month grid, event list, role-filtered events (enrolled-course events + null-courseId events), create event modal.
11. **Packages** — list, role visibility, tier/level display, includes checklist.
12. **Hardware** — kit list, assignment modal, availability calculation (`returnedAt IS NULL`).
13. **Users (Admin)** — list with filters, edit-role modal, role/department/schoolLevel updates.
14. **Settings** — profile update, password change.
15. **Announcements** — list ordered by `createdAt desc`, create form (teacher/admin).
16. **Cross-cutting concerns** — middleware matcher correctness, async `params` usage everywhere, `<Link>` usage (no `legacyBehavior`), `cookies()` / `headers()` awaited, server vs. client component boundaries, dead/orphaned files, unused exports.

Each section in the report contains:

- **What it should do** — one line summary from the spec.
- **Findings** — the list of issues, each in the format defined in §5.
- **Mini coverage table** — route × role grid for that feature, ✓ / ⚠ / 🚫.

---

## 5. Finding Format

Every finding follows this template:

```markdown
### [SEV] Short title
- **Feature:** <feature section name>
- **Location:** <file:line> (or "runtime — no single file")
- **Roles affected:** STUDENT | TEACHER | ADMIN | ALL
- **Expected (per CLAUDE.md):** <what the spec says>
- **Actual:** <what the code/runtime does>
- **Repro:** <code trace or browser steps>
- **Notes:** <optional>
```

### Severity taxonomy

| Severity | Meaning | Example |
|---|---|---|
| 🔴 **BLOCKER** | Feature is unusable, crashes, data loss possible, auth bypass, build-breaking. | Login redirects to a page that 500s. Anyone can hit `/api/users` without auth. |
| 🟡 **BUG** | Feature works partially or wrong: incorrect data, missing field, wrong role allowed, validation skipped, async params not awaited, dead button, broken link. | `gradedAt` never set on grade. `params` accessed without `await`. |
| 🔵 **POLISH** | Spec mismatch is cosmetic: wrong copy, missing loading state, mobile layout glitch that doesn't block use. | Sidebar nav label says "Tasks" but spec says "My Tasks". |
| ⚪ **NOTE** | Not a bug. Worth flagging — e.g. code is actually better than spec, suggest updating spec. | Spec says default `maxStudents` is 30; code defaults to 40. Confirm intent. |

The fix-pass spec is expected to target 🔴 and 🟡 only, deferring 🔵 to the redesign track and ⚪ to a spec-update conversation.

---

## 6. Deliverable

### Report file

`docs/superpowers/audits/2026-04-08-e2e-audit-report.md`

Structure:

```
# E2E Audit Report — 2026-04-08

## Summary
  - Total findings: X (🔴 a / 🟡 b / 🔵 c / ⚪ d)
  - Coverage: N/N features audited, N/N routes touched
  - Environment: code audit ✓, runtime ✓ | blocked (reason)

## Findings by Feature
  ### 1. Auth & Session
    - what it should do
    - findings (in severity order: 🔴 first)
    - mini coverage table
  ### 2. Dashboard
  ...
  ### 16. Cross-cutting concerns

## Coverage Appendix
  - Route × Role matrix (every route in src/app, S/T/A columns, ✓/⚠/🚫)
  - Files-not-touched list (anything under src/ that wasn't opened during the audit, with reason)

## Environment Notes
  - How runtime checks were performed
  - What worked, what didn't
  - Any seed/env issues encountered
```

### Design file (this document)

`docs/superpowers/specs/2026-04-08-e2e-audit-design.md` — committed to git alongside the future implementation plan.

---

## 7. Execution Notes

- The audit produces **no code changes**. If a fix is "obviously a one-liner", it still goes in the report, not the code. Discipline matters here — fix-as-you-go smuggles in scope creep.
- Findings should be **traceable**: every entry has either a `file:line` or runtime repro steps. "I think the dashboard is broken" is not a finding.
- The audit is allowed to **pause** to ask the user a question if a spec/code conflict is genuinely ambiguous (i.e., you can't tell which is the source of truth). Default behavior in ambiguous cases: file as ⚪ NOTE and continue.
- **Subagents:** the implementation plan may dispatch parallel subagents per feature section, since most sections are independent. That decision belongs to the writing-plans phase, not this design.

---

## 8. Success criteria

The audit is complete when:

1. Every feature in §4 has a section in the report.
2. Every route under `src/app` appears in the route × role coverage matrix.
3. Every finding has the fields required by §5.
4. The Environment Notes section accurately describes what was and wasn't runtime-verified.
5. The summary counts match the body.

The audit is **successful** (regardless of finding count) when the user can read the report and decide which findings to turn into a fix-pass spec without needing to re-investigate any item.
