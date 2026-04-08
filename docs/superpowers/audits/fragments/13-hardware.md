# 13 — Hardware (Kits + Assignments) Audit

Scope: `src/app/(dashboard)/hardware/page.tsx`, `src/app/api/hardware/route.ts`, `src/app/api/hardware/assign/route.ts`, `src/actions/hardware-actions.ts`, `src/components/hardware/kit-card.tsx`, `src/components/hardware/assign-kit-modal.tsx`. Supporting context consulted: `src/components/hardware/hardware-client.tsx`, `src/components/layout/sidebar.tsx`, `src/middleware.ts`.

Coverage: page (route gating + data fetch), GET/POST API routes, server actions (assignKit / returnKit / createKit / updateKit), kit card presentation, assign modal flow, nav gating. Not in scope (not present in listed files but noted in passing): kit-form-modal, assign-kit-trigger, hardware-client.

Severity legend: P0 (correctness/security), P1 (spec drift / UX bug), P2 (polish / consistency), P3 (nit).

---

## P0 — POST /api/hardware/assign lacks Zod validation and kit/user existence check for userId

File: `src/app/api/hardware/assign/route.ts` (lines 16–24, 49–54)

The handler parses `request.json()` and reads `kitId` / `userId` directly with no schema validation (no Zod, unlike most other routes in the spec), no type check, and no verification that `userId` refers to an existing user. A malformed or malicious caller (teacher/admin session) can POST an arbitrary string as `userId` and Prisma will throw an FK error 500 instead of a clean 400/404. It also never checks whether the target user already has an active (un-returned) assignment for that kit — so the same user can be assigned the same kit multiple times through this route, even though the server action `assignKit` in `hardware-actions.ts` (lines 26–32) explicitly guards against that. Recommend: add a Zod schema (`z.object({ kitId: z.string().cuid(), userId: z.string().cuid() })`), verify the user exists (and is a STUDENT, if business rule), and replicate the duplicate-active-assignment guard. Note also the schema has `@@unique([kitId, userId])` on `HardwareAssignment` — so once a user has *ever* been assigned a kit and it was returned, re-assigning will violate the unique constraint and surface as a Prisma 500. This is a latent correctness problem shared with the server action below.

## P0 — `@@unique([kitId, userId])` conflicts with "return then re-assign" lifecycle

File: `prisma/schema.prisma` (HardwareAssignment, referenced by both route and action); exposed through `src/actions/hardware-actions.ts` lines 26–36 and `src/app/api/hardware/assign/route.ts` lines 49–54.

`HardwareAssignment` has `@@unique([kitId, userId])`. Both the API route and `assignKit` server action create a new row on every assignment. After a `returnKit` call (action lines 42–62) sets `returnedAt`, the row persists — so the next `assignKit` for the same (kit, user) pair will fail with a Prisma P2002 unique constraint error (uncaught; surfaces to the client as a generic "Failed to assign kit"). The action's duplicate check (`findFirst … returnedAt: null`) only catches the *active* duplicate case, not the historical one. Either drop the composite unique (assignments are historical events), or change the flow to upsert/reactivate the existing row (`update where id… set returnedAt: null, assignedAt: now()`). This matters in practice — the seed assigns kits to all three students, so any teacher/admin trying to re-issue a returned kit will hit this.

## P1 — Hardware page performs role gating with `redirect`, diverges from established `requireRole` / middleware pattern

File: `src/app/(dashboard)/hardware/page.tsx` lines 6–9.

The page does `if (user.role === "STUDENT") redirect("/dashboard")` rather than using `requireRole(["TEACHER", "ADMIN"])` from `auth-helpers.ts`. Functionally equivalent for STUDENT, but:
1. It silently allows any non-STUDENT role (future roles, or a user with `role` set to an unexpected string) through.
2. It is inconsistent with other protected pages in the codebase and with the spec ("Hardware page accessible only to teacher/admin").
3. Middleware (`src/middleware.ts` line 18) only gates authentication, not role — so a logged-in student URL-accessing `/hardware` relies on this page-level check. Using a denylist instead of an allowlist is the weaker option. Recommend `requireRole(["TEACHER", "ADMIN"])` wrapped in a try/catch that redirects to `/dashboard` on `Forbidden`.

## P1 — `assign-kit-modal.tsx` is orphaned; page flow uses a different component

File: `src/components/hardware/assign-kit-modal.tsx` vs `src/components/hardware/hardware-client.tsx` line 9 (imports `AssignKitTrigger`, not `AssignKitModal`).

`assign-kit-modal.tsx` is `"use client"`, wires `assignKit` server action, and matches the spec. But `HardwareClient` renders `<AssignKitTrigger>` instead, meaning the file in scope is not actually on the user path. Two risks: (a) dead code that will drift from the live trigger component; (b) any audit/test effort on this file is wasted. Either delete `assign-kit-modal.tsx` or make `AssignKitTrigger` a thin wrapper that uses it. Also: the modal's prop shape (`kit: { id, name }`, `students`) suggests it was the original design — worth confirming `AssignKitTrigger` preserves the same UX (student select, duplicate guard via server action response, toast feedback).

## P1 — GET /api/hardware returns `_count.assignments` but page bypasses the API entirely

File: `src/app/api/hardware/route.ts` lines 16–26; `src/app/(dashboard)/hardware/page.tsx` lines 11–19.

The API route returns kits with `_count.assignments` (active). The page does not call this API — it goes directly to Prisma and instead `include`s the full assignments array (with user name, id). That's fine for the page (it needs the names to render the return list in `HardwareClient`), but it means the API route is currently unused by any surface in the listed scope. If no client consumes it, remove it, or align the page to use it. If it's intentionally exposed for external consumers, add: pagination, a search param, and consistent shape with what the page needs (name list, not just count). Minor: the API response does not include `level`/`specs` filtering or sorting (`orderBy`), whereas the page sorts by `name`.

## P1 — `returnKit` action has no ownership/scoping check

File: `src/actions/hardware-actions.ts` lines 42–62.

`returnKit` requires TEACHER/ADMIN role but does not verify the caller is actually responsible for the assignment's course/kit context. Any teacher can return any assignment across the org. For a small LMS this may be acceptable, but the spec says nothing explicit — flagging as P1 for decision. Also: the action does not set/track *who* returned the kit, so audit trail is lost.

## P1 — `createKit` / `updateKit` bypass Zod entirely and cast `level` with `as any`

File: `src/actions/hardware-actions.ts` lines 64–112.

Both admin actions read FormData fields manually, bounce `level` straight into Prisma with `as any`, and do not validate enum membership, string length, or `totalQty` bounds (`Number("")` → 0, `Number("abc")` → NaN → Prisma error). Recommend a `createKitSchema` / `updateKitSchema` in `src/lib/validations.ts` with `level: z.enum(["ELEMENTARY","HS","COLLEGE"])`, `totalQty: z.number().int().min(1).max(500)`, `name: z.string().min(2).max(100)`, `specs: z.string().min(5)`. `updateKit` additionally does not prevent `totalQty` from being reduced below current active assignment count, which will quietly produce "Available = negative" on the KitCard.

## P2 — `KitCard` allows negative `available`

File: `src/components/hardware/kit-card.tsx` lines 22, 67.

`const available = kit.totalQty - kit.assignedCount`. If an admin reduces `totalQty` below active assignments (see P1 above), this renders as a negative number in the Available stat box and the progress bar will exceed 100%. Suggest `Math.max(0, kit.totalQty - kit.assignedCount)` and clamp `assignedRatio` to `[0, 100]`.

## P2 — `LevelBadge` receives a raw string from Prisma enum, not a typed enum

File: `src/components/hardware/kit-card.tsx` line 36 (`level: string` on KitCardData, line 11).

Minor type laxity — `level` should be `SchoolLevel` or the union literal, so bad data (e.g., `"MIDDLE"`) surfaces at compile time rather than silently rendering a mis-styled badge. Page/hardware-client currently passes it through as plain string.

## P2 — AssignKitModal's student list is unfiltered for availability/duplicates

File: `src/components/hardware/assign-kit-modal.tsx` lines 97–108.

The `<Select>` lists every student, including those who already have the same kit assigned (the server action will reject with "User already has this kit assigned", good — but poor UX). Ideally pass a filtered list or visually disable options already holding this kit. Also: no empty-state when `students.length === 0`.

## P2 — AssignKitModal assumes `error` is a string in one branch

File: `src/components/hardware/assign-kit-modal.tsx` lines 51–53.

`typeof result.error === "string" ? result.error : "Failed to assign kit."` — defensive but masks structured field errors if `assignKit` is ever changed to return Zod field errors (as other actions do). Consider normalizing in one place.

## P2 — Spec wording: font role for specs/stat numbers

Spec says KitCard stat boxes show JetBrains Mono **18px weight-700** values and **10px label** below. Implementation matches (lines 50–71). Specs string is 12px mono — matches spec. No action, noted for coverage.

## P3 — No `dynamic = "force-dynamic"` or caching hint

File: `src/app/(dashboard)/hardware/page.tsx`. Per Next.js 16 everything is dynamic by default, so fine, but worth a comment: `revalidatePath("/hardware")` calls in the actions assume the page is not cached. Verified — no `"use cache"` directive present. OK.

## P3 — `assignKit` server action returns `assignmentId` but modal ignores it

File: `src/actions/hardware-actions.ts` line 39; `src/components/hardware/assign-kit-modal.tsx` lines 49–58. Benign; future cleanup.

## P3 — Emoji input validation missing in createKit

File: `src/actions/hardware-actions.ts` line 71. Accepts any string as `imageEmoji`; no length cap; no actual emoji check. Low risk since field is only shown on card.

---

## Coverage line

Reviewed all 6 in-scope files end-to-end. Cross-referenced: sidebar.tsx (nav gating confirmed teacher/admin, line 47), middleware.ts (confirms auth gating only, not role), hardware-client.tsx (to resolve page-to-component wiring), prisma schema (HardwareAssignment uniqueness). Not reviewed (out of scope): kit-form-modal.tsx, assign-kit-trigger.tsx, ui primitives (Card, ProgressBar, Modal, Select, Toast), auth-helpers.ts internals.
