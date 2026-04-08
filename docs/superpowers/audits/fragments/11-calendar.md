# Calendar Audit

Scope: src/app/(dashboard)/calendar/page.tsx, src/app/(dashboard)/calendar/calendar-view.tsx, src/app/api/calendar/route.ts, src/actions/calendar-actions.ts, src/components/calendar/calendar-grid.tsx, src/components/calendar/event-list.tsx, src/components/calendar/create-event-form.tsx, src/lib/validations.ts (createEventSchema).

---

## Findings

### HIGH-1 — Calendar page ignores role-based event filtering from spec
**File:** `src/app/(dashboard)/calendar/page.tsx:12-23`
The page fetches **all** `calendarEvent` rows directly via Prisma with no `where` clause. The spec requires: "Events filtered by role's enrolled courses + null courseId events". This is correctly implemented in `/api/calendar` (route.ts:33-41) but the page component bypasses the API and queries Prisma directly without filtering. Students therefore see deadlines and exams for courses they are not enrolled in; teachers see events for courses they do not instruct. The `?month=YYYY-MM` filter is also not applied server-side — the page fetches every event ever.

Fix: replicate the `OR: [{ courseId: null }, { courseId: { in: userCourseIds } }]` filter (scoped by role) in the page loader, or have the page call the API route.

### HIGH-2 — `createEventSchema` `courseId` cannot receive `""`
**File:** `src/lib/validations.ts:56-61`, `src/actions/calendar-actions.ts:15`, `src/components/calendar/create-event-form.tsx:122-123`
The "No course" option in the select has `value=""`. `formData.get("courseId")` returns the string `""` (not null), and `?? undefined` only collapses null/undefined, so the server action hands `""` to Zod's `z.string().cuid().optional()`, which rejects empty strings as invalid cuids. Users who pick "No course" (including the default) will see a validation error rather than a global event being created. Same hazard exists for the `/api/calendar` POST path when called with `courseId: ""`.

Fix: in the action, coerce `""` to `undefined` (`const courseId = formData.get("courseId"); parsed = {..., courseId: courseId ? String(courseId) : undefined}`), or make the schema `z.string().cuid().optional().or(z.literal("").transform(() => undefined))`.

### MEDIUM-1 — No `revalidatePath` or refetch after creating an event via server action
**File:** `src/components/calendar/create-event-form.tsx:34-47`, `src/actions/calendar-actions.ts:29`
`createEvent` does call `revalidatePath("/calendar")`, but `CalendarView` is a `"use client"` component seeded from the server page's props. Since the form closes without a router refresh (`router.refresh()` is never called), the new event will not appear on the grid/event list until the user manually navigates away and back. Same for `deleteEvent` in `event-list.tsx:33-37`.

Fix: call `useRouter().refresh()` after successful create/delete, or restructure to re-fetch.

### MEDIUM-2 — `/api/calendar` GET ignores `session.user.role === "ADMIN"` path but still returns unfiltered dataset correctly — however month filter does not parse fallback
**File:** `src/app/api/calendar/route.ts:44-52`
If `month` param is malformed (e.g. `2026-13` or `2026-AA`), `Number()` yields `NaN`, `new Date(NaN, …)` produces `Invalid Date`, and Prisma will throw at query time with an unhelpful 500. Low blast radius but should be validated with a regex or zod and rejected 400.

### MEDIUM-3 — Calendar grid "today" detection uses client clock only
**File:** `src/components/calendar/calendar-grid.tsx:43-46`
`new Date()` at render time is a client clock. The spec pins "today is 2026-04-08" but nothing is hardcoded — behavior correctly floats with the user's system clock. No bug, but note that SSR/CSR hydration can mismatch on day boundaries because `CalendarGrid` is client-only here (no SSR of the highlight), so this is fine. Flagging for awareness only.

### LOW-1 — Event list "this month" filter happens in JS, defeats any server-side month scoping
**File:** `src/app/(dashboard)/calendar/calendar-view.tsx:36-47`
`monthEvents` filters the full events array in memory. Combined with HIGH-1, the server is sending every event on every navigation. Once HIGH-1 is fixed to scope by role, consider also scoping by month (matching `?month=YYYY-MM` spec) to avoid shipping the entire year to the client.

### LOW-2 — Create event form lacks `courseId` validation feedback and has no client-side date min
**File:** `src/components/calendar/create-event-form.tsx:98-103`
The date `<Input type="date">` has no `min` attribute; teachers can create events in the past without warning. Not a spec violation, but user-hostile for a "deadline" type.

### LOW-3 — `deleteEvent` action not in spec, no authorization scoping
**File:** `src/actions/calendar-actions.ts:33-43`
Spec lists only GET/POST for `/api/calendar`; the action `deleteEvent` is an undocumented addition. It gates on `requireRole(["TEACHER", "ADMIN"])` but does not verify the event belongs to a course taught by the caller — any teacher can delete any other teacher's or admin's events, including global (`courseId: null`) events. Consider scoping deletion to events where `course.instructorId === user.id` or admin.

### LOW-4 — Badge variant for `event` uses `info` but spec specifies dot color `signal` for events
**File:** `src/components/calendar/event-list.tsx:23-27` vs `src/components/calendar/calendar-grid.tsx:21-25`
The event list's `event` type renders as an `info` (blue) badge, while the grid dots use `signal` (cyan-teal) per spec. Minor visual inconsistency — the sidebar event rendering and grid dot legend diverge.

### LOW-5 — `/api/calendar` GET allows student whose `session.user.role` is missing to fall through to "any courseId filter" path
**File:** `src/app/api/calendar/route.ts:17-41`
If `session.user.role` is undefined (shouldn't happen with JWT callback but defensive), `courseIds` stays `[]` and `where.OR = [{courseId: null}, {courseId: {in: []}}]`. Prisma accepts empty-`in` and returns zero course-scoped events. Benign, noted for defensiveness.

### INFO-1 — All client components correctly marked
`calendar-grid.tsx`, `event-list.tsx`, `create-event-form.tsx`, `calendar-view.tsx` all start with `"use client"`. Good.

### INFO-2 — No dynamic route params in calendar area
No `[param]` segments used, so the Next.js 16 async-params pattern is N/A here.

### INFO-3 — Grid structure matches spec
7-column CSS grid (`grid-cols-7`), `aspect-square` day cells, today highlighted with `bg-signal-muted` + `text-signal` + `font-bold` (Outfit weight 700 via `font-bold` on Outfit family), day headers in JetBrains Mono 10px uppercase tracking-1px. Event dots 5×5, color-coded warning/danger/signal correctly per spec.

---

## Coverage

Reviewed: page loader, API GET/POST, server actions (create + delete), calendar grid, event list, create modal, Zod schema. Not reviewed: reusable `Modal`, `Input`, `Select`, `Button`, `Badge`, `Card`, `ConfirmationDialog` primitives (out of scope). Spot-checked interactions with Enrollment/Course Prisma models for role filtering.
