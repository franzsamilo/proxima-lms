# Audit Fragment 16 — Announcements

**Scope:** Announcement read/write surfaces (API route, server action, dashboard panel).

**Files reviewed:**
- `src/app/api/announcements/route.ts`
- `src/actions/announcement-actions.ts`
- `src/components/dashboard/announcements-panel.tsx`
- `src/app/(dashboard)/dashboard/page.tsx` (consumer, lines 169-194)

**Coverage:** API GET/POST, server action `createAnnouncement`, dashboard read panel. No dedicated `/announcements` page exists; no create-form UI exists anywhere in the app.

---

## Findings

### 🔴 HIGH — No Zod validation on `POST /api/announcements`
`src/app/api/announcements/route.ts:32-40` destructures `title`, `content`, `priority` directly from the JSON body and only checks truthiness. Spec pattern elsewhere mandates Zod validation. Consequences:
- `priority` accepts arbitrary strings (no enum enforcement: `"low" | "normal" | "high"`), while the server action schema at `announcement-actions.ts:8-12` correctly restricts it. Inconsistency between the two write paths.
- No length bounds on `title`/`content` — the server action enforces `title.min(2).max(100)`; the API does not.
- `authorId` is set from `session.user.id` without verifying the user still exists (minor; Prisma FK will throw, but returns a 500).

**Fix:** extract `createAnnouncementSchema` to `src/lib/validations.ts` and share between the API route and the server action.

### 🟡 MEDIUM — `GET /api/announcements` has no ordering limit or pagination
`route.ts:11-16` fetches every announcement in the table with `include: author`. On long-running courses this grows unbounded. The dashboard page (`dashboard/page.tsx:178`) correctly applies `take: 5` via its own direct Prisma query, which means the API route is currently unused by the dashboard — it exists only as an unbounded firehose for hypothetical future callers. Add `take` default + `?limit=` / `?cursor=` support, or at minimum a hard cap.

### 🟡 MEDIUM — Dashboard bypasses the API and server action entirely
`dashboard/page.tsx:176-186` calls `prisma.announcement.findMany` directly in the page RSC rather than reusing the API route. Not a bug per se (RSC + Prisma is idiomatic), but it means:
- The `GET` route's `include: { author }` shape is unused (see MEDIUM above).
- Any future ACL/visibility rule added to the API will silently not apply to the dashboard.
Recommend centralising announcement reads in a `lib/announcements.ts` helper.

### 🟡 MEDIUM — `priority` is an untyped `String` in Prisma
`prisma/schema.prisma` models `priority String @default("normal")`. Both the server action and audit spec treat it as an enum (`low | normal | high`). Promote to a Prisma enum (`AnnouncementPriority`) to enforce at the DB layer and drop manual validation divergence.

### 🟢 LOW — Missing `updatedAt` / edit + delete surfaces
The `Announcement` model has no `updatedAt` field and there are no PATCH/DELETE routes or actions. Typos in announcements cannot be corrected. Not spec-required, but worth logging.

### 🟢 LOW — `relativeTime()` uses client-side `new Date()` inside an RSC
`announcements-panel.tsx:16-29` runs at render time on the server; the "2m ago" label is baked into HTML and will drift until the next revalidation. Acceptable given dashboard is dynamic, but if any caching is later added it becomes stale. Consider rendering the absolute timestamp and formatting client-side, or adding `suppressHydrationWarning`.

### 🟢 LOW — No priority ordering, only `createdAt desc`
High-priority announcements (e.g. "Robotics Fair Registration") sink below newer `normal` items. Spec says order by `createdAt desc`, so this matches spec, but pedagogically `ORDER BY priority='high' DESC, createdAt DESC` is typical for announcement widgets. Flag only.

### 🟢 LOW — Badge variant coverage incomplete
`announcements-panel.tsx:55` maps only `high → danger`, everything else → `neutral`. `low` and `normal` collapse to the same visual. Spec defines a `warning-tint` badge for pending/low — consider `high=danger`, `normal=info`, `low=neutral`.

### ⚪ NOTE — No UI for creating announcements
No page, modal, or form invokes `createAnnouncement` or posts to `/api/announcements`. Grep for `createAnnouncement` returns only its own definition. Teachers and admins have no way to create announcements through the app — they are seeded only. Either:
1. Add a "New Announcement" modal on `/dashboard` (teacher/admin conditional), or
2. Add a dedicated `/announcements` management page under `(dashboard)`.

Until then the entire write path (`POST` route + server action) is dead code from the UI perspective and should be treated as untested.

### ⚪ NOTE — `createAnnouncement` server action only revalidates `/dashboard`
If a future `/announcements` page is added, the action must also `revalidatePath("/announcements")`. Log for cross-reference with the UI task.

---

## Coverage

Read path (API + dashboard panel): covered. Write path (API POST + server action): covered at the code level but **unreachable from the UI**. No edit/delete surfaces exist and were not in scope. Schema-level `priority` enum, pagination, and shared Zod schema are the highest-value follow-ups.
