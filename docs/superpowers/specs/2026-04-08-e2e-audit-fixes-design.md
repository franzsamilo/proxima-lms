# E2E Audit Fix-Pass — Design Spec
**Date:** 2026-04-08
**Source audit:** `docs/superpowers/audits/2026-04-08-e2e-audit-report.md`
**Source plan (audit):** `docs/superpowers/plans/2026-04-08-e2e-audit.md`

---

## Goal

Close every 🔴 BLOCKER, 🟡 BUG, and 🔵 POLISH finding produced by the 2026-04-08 E2E audit on a single feature branch and merge them via one pull request.

**Counts to close:** 99 findings — 12 🔴 + 41 🟡 + 46 🔵.

**Out of scope:** All 38 ⚪ NOTE findings. They're tracked in §7 below as a deferred follow-up checklist; no fix work for them in this pass.

---

## 1. Branch + delivery

- **Branch:** `fix/e2e-audit-cleanup` cut from `main` at the head commit produced by the audit (`docs(audit): E2E audit fragments + final report`).
- **Single PR** at the end. Title: `fix: close 99 findings from 2026-04-08 E2E audit`.
- **Commit cadence:** one commit per task bucket (16 fix commits + prep + wrap = up to 18 commits). Each commit message references the fragment file and lists the closed finding titles.

---

## 2. Verification gate

Each task bucket finishes by running, in order:

1. `npx tsc --noEmit` — must be clean.
2. `npx prisma validate` — must be clean.
3. `npm run build` — Turbopack production build, must succeed.
4. **Manual cross-check:** for every finding the bucket claims to close, re-read the fragment's "Expected" line and the new code at `file:line` and confirm they now agree. The implementer logs the cross-check inline in the commit body.

If any gate fails, the bucket does not advance and the implementer fixes the regression in the same commit (or aborts and reports BLOCKED to the controller).

No automated test framework is added in this pass — repo currently has none, and adding one is out of scope.

---

## 3. Data-layer change (the only schema mutation)

**Migration:** `relax_hardware_assignment_unique`
- **Files:** `prisma/schema.prisma`, `prisma/migrations/<timestamp>_relax_hardware_assignment_unique/migration.sql`.
- **Schema change:** drop `@@unique([kitId, userId])` from `model HardwareAssignment`; replace with `@@index([kitId, userId])` so lookup performance is preserved.
- **Apply:** `npx prisma migrate dev --name relax_hardware_assignment_unique` against the connected Supabase dev DB during the Hardware task bucket.
- **Risk profile:** non-destructive. PostgreSQL `DROP CONSTRAINT` on a unique constraint preserves data; the new `@@index` is created separately. No `seed.ts` row depends on the constraint surviving.
- **Sanity check:** before applying, snapshot `SELECT count(*) FROM "HardwareAssignment";` and `SELECT count(*) FROM "HardwareAssignment" WHERE "returnedAt" IS NULL;`. Compare after apply — counts must be identical.
- **Rollback:** if the migration fails or post-migration build is broken, `npx prisma migrate resolve --rolled-back <name>` and revert the schema change. Spec stops the bucket and reports BLOCKED.

---

## 4. Task buckets

Sixteen fix buckets, each scoped to one audit fragment so the implementer's "definition of done" is "every non-NOTE finding in fragment NN is closed and cross-checked." Two more buckets bookend the pass.

| # | Bucket | Fragment | 🔴 | 🟡 | 🔵 | Notes |
|---|---|---|---|---|---|---|
| 0 | Branch + workspace prep | — | — | — | — | Cut branch, sanity check |
| 1 | Cross-cutting | 17 | 0 | 0 | 4 | `icon.svg`→`logo.svg`, middleware `auth()` HOF, delete `use-current-user.ts`, add `mobile-nav.tsx` (or document fold-in) |
| 2 | Auth & Session | 02 | 1 | 3 | 0 | Middleware HOF (overlaps #1), schoolLevel enum, register API error key, matcher asset name |
| 3 | Dashboard | 03 | 2 | 0 | 0 | Topbar `pageTitle` prop channel + `DashboardShell` plumbing |
| 4 | Courses (Read) | 04 | 1 | 0 | 1 | Wire `?level=`/`?search=` through page; chevron 90° |
| 5 | Courses (Write) | 05 | 1 | 1 | 0 | `createCourse` action sets `isPublished:false`; PATCH route Zod-validates body |
| 6 | Modules & Lessons (Write) | 06 | 0 | 0 | 3 | `revalidatePath` on PATCH module/lesson; PATCH bodies Zod-validated |
| 7 | Lesson Viewer | 07 | 1 | 2 | 1 | API allows ADMIN; page enforces enrollment; quiz hard-validates submission; Monaco theme registered before mount |
| 8 | Tasks list/detail | 08 | 0 | 9 | 5 | Largest bug bucket — DRAFT visibility, status validation, ordering parity, type-aware submit, re-submit on graded, ADMIN check, server-side tabs, code-viewer/video-player styling |
| 9 | Grading | 09 | 0 | 0 | 3 | Allow-list role check on PATCH, `revalidatePath` parity, block re-grading already-GRADED |
| 10 | Grades page | 10 | 1 | 2 | 4 | Role-aware fetch (teacher/admin views), `totalTasks` only counts gradable lessons, dedupe loop, prune dead helpers, fix duration class |
| 11 | Calendar | 11 | 2 | 3 | 5 | Page uses role-filtered query; courseId `""`→null coercion in schema; `router.refresh()` after mutation; month param validation; deleteEvent auth; badge color parity |
| 12 | Packages | 12 | 0 | 5 | 0 | Subscribe button label, modules+lessons stat, USD format, hairline border + 3px top accent, public API access |
| 13 | Hardware | 13 | 2 | 5 | 5 | Zod on assign route, drop `@@unique` (migration), allow-list role gates, delete orphan `assign-kit-modal.tsx` (or rewire), `KitCard` clamp, validation on createKit/updateKit |
| 14 | Users (Admin) | 14 | 0 | 4 | 4 | Self-demote guard, FormData empty-string handling, schoolLevel `null` clear, `?role=` Zod validation, page-uses-API, name field in modal |
| 15 | Settings | 15 | 0 | 4 | 7 | Zod on profile + password actions, JWT refresh after name change, `revalidatePath("/", "layout")`, scope `department` to teachers, useActionState wiring |
| 16 | Announcements | 16 | 1 | 3 | 4 | Zod on POST, `priority` enum in Prisma + migration?† see §6, dashboard reads via canonical source |
| 17 | Final wrap | — | — | — | — | Re-grep fragments for closed-finding claims, run full gate, draft PR body |

†The announcements `priority` enum change (fragment 16, finding M3) requires a second small Prisma migration. See §6.

**Total:** 12 🔴 + 41 🟡 + 46 🔵 = 99 closures expected.

---

## 5. Dependency order rationale

1. **Bucket 1 (cross-cutting) first** because the `icon.svg`→`logo.svg` rename, middleware `auth()` HOF refactor, and dead-file deletion touch files imported across the app. Doing them first prevents merge churn in later buckets.
2. **Bucket 2 (auth) second** since later buckets depend on the corrected `auth()` middleware export, the role enum, and the register flow.
3. **Buckets 3–12** in fragment order — they're independent enough that order is mostly cosmetic. Dashboard (#3) goes early because the `Topbar`/`DashboardShell` change touches the layout shared by every page.
4. **Bucket 13 (hardware)** mid-late so the Prisma migration runs once after most code-only churn has settled. This also means a single tsc/build cycle can validate both the migrated client and consumer pages.
5. **Buckets 14–16** after the migration since announcements may also touch the Prisma client.
6. **Bucket 17 (wrap)** last — full verification gate + PR draft.

---

## 6. Two Prisma migrations (not one)

Re-reading fragment 16 against the schema, the announcements `priority` field is currently `String @default("normal")`. Fragment 16 finding M3 calls for converting it to a Prisma enum. That's a second migration:

**Migration:** `announcement_priority_enum`
- **Schema:** add `enum AnnouncementPriority { LOW NORMAL HIGH }`; change `Announcement.priority` from `String` to `AnnouncementPriority @default(NORMAL)`.
- **Data backfill:** SQL `UPDATE "Announcement" SET "priority" = upper("priority")` runs before the type change so existing seed rows (`'normal'`, `'high'`) become valid enum values.
- **Apply:** during the Announcements task bucket via `npx prisma migrate dev --name announcement_priority_enum`.
- **Sanity:** snapshot row count before/after; assert no rows have a priority outside the enum after backfill.

Both migrations are non-destructive but each one shifts the generated Prisma client, so each must be followed by `tsc --noEmit` to catch type drift in consumers.

---

## 7. Deferred ⚪ NOTES (out of scope, tracked here)

The 38 ⚪ NOTE findings stay open after this pass. They include:

- Items that strictly require runtime/browser verification (hydration, Monaco mount, mobile layout) — addressed when a runtime audit pass is scheduled.
- Cosmetic typography drift on packages/cards.
- "Two sources of truth" notes where a page bypasses an API route — flagged but not blocking; will be folded into a follow-up "API consolidation" pass.
- Misc nits (`as any` casts, redundant role casts, comment cleanup).

A short follow-up doc `docs/superpowers/audits/2026-04-08-deferred-notes.md` is generated by the wrap task (#17) listing every ⚪ NOTE with its source fragment and a one-line rationale for deferral.

---

## 8. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Supabase migration fails mid-apply | Low | Snapshot counts; rollback procedure in §3 |
| Type drift after Prisma client regen breaks downstream code | Medium | `tsc --noEmit` after each migration; fix in same bucket |
| Topbar/DashboardShell prop change breaks page renders | Medium | Bucket #3 includes a manual sweep of every dashboard page that mounts the topbar; tsc catches signature breaks |
| Hardware @@unique drop reveals latent duplicate-row bugs | Low | Pre-snapshot `SELECT kitId,userId,count(*) ... GROUP BY ... HAVING count(*) > 1` to confirm no existing duplicates depend on the constraint |
| Bucket #8 (tasks, 14 findings) is large enough to exceed a single subagent's reliability | Medium | Pre-split the bucket into 8a (API/route) and 8b (page/components) if the implementer reports BLOCKED |
| Fix introduces a new finding that isn't caught by tsc/build | High (the audit was code-only) | Out of scope for this pass; next audit run catches it |

---

## 9. Acceptance criteria

The fix-pass is **done** when:

1. Every non-NOTE finding from the audit is referenced by at least one commit on `fix/e2e-audit-cleanup` and the cited code now matches the fragment's "Expected" line.
2. `npx tsc --noEmit`, `npx prisma validate`, and `npm run build` all pass on the head of the branch.
3. The PR description summarizes closures grouped by feature area, lists the two migrations, and lists the deferred ⚪ NOTES.
4. `docs/superpowers/audits/2026-04-08-deferred-notes.md` exists and lists all 38 ⚪ NOTES with rationale.
5. No application code outside the audit's "Files" lists has been touched (the pass is corrective, not refactor-creep).

---

## 10. Non-goals

- No new test framework.
- No design-system overhaul beyond what individual findings call for.
- No auth provider change (still Credentials + Auth.js v5).
- No new features.
- No runtime/browser audit pass — that's a separate effort scheduled after this fix-pass merges.
- No refactor of any file the audit didn't flag, even if "while we're here" feels tempting.
