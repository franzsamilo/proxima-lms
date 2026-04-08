# 14 — Users (Admin)

Scope: `/users` page, `/api/users`, `/api/users/[userId]`, `updateUser` server action, user table + edit modal, `updateUserSchema`.

## Findings

### 🟡 M1 — Admin can demote/lock themselves out
`PATCH /api/users/[userId]` (src/app/api/users/[userId]/route.ts) and `updateUser` server action (src/actions/user-actions.ts) perform `requireRole(["ADMIN"])` / session admin check, but neither prevents an admin from changing **their own** role away from `ADMIN`. If the only admin demotes themselves, the system is left without any admin access path (no elevation UI exists). Recommend blocking `session.user.id === userId && parsed.data.role && parsed.data.role !== "ADMIN"` with an explicit 400/error, or at minimum guarding the "last remaining admin" case with a count check.

### 🟡 M2 — `updateUser` server action writes empty-string department silently
src/actions/user-actions.ts:14-19 builds the Zod input with:
```ts
department: formData.get("department") ?? undefined,
```
`FormData.get` returns `null` when missing (coerced to `undefined` — OK) **but returns `""` when the field is present and empty**. The edit modal (src/components/users/edit-user-modal.tsx:40) always calls `formData.set("department", department)` regardless of value, so clearing the department field writes an empty string `""` to the DB instead of leaving it unchanged or nulling it. `updateUserSchema.department` is `z.string().optional()` with no `.min(1)` and is **not nullable**, so `""` passes validation and overwrites the column. Either:
- treat empty string as `undefined` (skip) or `null` (clear) explicitly, and
- make `department` `.nullable()` in `updateUserSchema` so clearing is expressible.

### 🟡 M3 — No way to clear a user's `schoolLevel` from the UI
`updateUserSchema.schoolLevel` is correctly `z.enum([...]).nullable().optional()` (src/lib/validations.ts:67), matching the spec. But the modal (edit-user-modal.tsx:42-44) only sends `schoolLevel` when a non-empty value is selected:
```ts
if (schoolLevel) { formData.set("schoolLevel", schoolLevel) }
```
Selecting "— None —" simply omits the field, so the action receives `undefined` and **leaves the old value intact**. There is no path from the UI to set `schoolLevel = null` for a user who previously had one (e.g. reclassifying a student to a teacher). Send `"null"`/explicit null through FormData and handle it in the action (`raw === "" || raw === "null" ? null : raw`).

### 🟡 M4 — `GET /api/users` passes `role` query param straight to Prisma
src/app/api/users/route.ts:21-23:
```ts
if (role) { where.role = role }
```
`role` is an unvalidated `string | null` from `searchParams`. Any non-enum value will cause Prisma to throw a 500 instead of a clean 400. Validate against `["STUDENT","TEACHER","ADMIN"]` (mirrors the pattern used in other routes, and matches spec's `?role=` filter). Same endpoint also has no pagination — full user table dumped on every call.

### 🔵 L1 — Page bypasses `/api/users` entirely
`src/app/(dashboard)/users/page.tsx` fetches with direct Prisma, and `UsersClient` does client-side in-memory filtering. The spec calls out `GET /api/users` with `?role=`/`?search=` filters (and `_count`), but no UI consumer exists. Either wire the client to the API (for scalability / server filtering) or remove the API route as dead code. Current state is two sources of truth.

### 🔵 L2 — `updateUserSchema.department` has no length bound
src/lib/validations.ts:66 — `department: z.string().optional()` allows arbitrarily long strings. Add `.max(100)` (or similar) to match the defensive posture of other schemas (e.g. `createCourseSchema.title.max(100)`).

### 🔵 L3 — Modal doesn't refresh server data on success
`EditUserModal.handleSave` closes on success but never calls `router.refresh()`. `updateUser` does `revalidatePath("/users")`, which *should* cover it for the Server Component parent, but because `UsersClient` holds `users` in a prop array (captured at mount) and manages edit state client-side, stale data remains visible until a full navigation. Call `router.refresh()` after `showToast("...success")` to re-fetch the server component tree.

### 🔵 L4 — Modal cannot edit `name` despite schema allowing it
`updateUserSchema` exposes `name?`, but the modal has no name input. The spec ("Edit role modal") arguably implies role-only, but the schema + action accept `name` — either remove it from the schema or expose a name input to keep surface area consistent.

### ⚪ N1 — `role` cast in page.tsx is redundant
src/app/(dashboard)/users/page.tsx:32 casts `u.role as "STUDENT" | "TEACHER" | "ADMIN"`. Prisma already returns the `Role` enum; the cast is unnecessary noise (and would mask a future enum addition). Prefer `role: u.role,` typed via `UserRow['role']` aligned with Prisma's enum.

### ⚪ N2 — `updateUser` revalidates a non-existent path
src/actions/user-actions.ts:29 calls `revalidatePath(`/users/${userId}`)`. No such dynamic route exists (no `/users/[userId]/page.tsx`). Harmless but dead.

### ⚪ N3 — Client filter uses `role.toLowerCase().includes(q)`
src/components/users/users-client.tsx:24 — lowercasing the enum string means searching "stu" matches STUDENT, but also means a future role containing another role name as substring would false-positive. Minor; switch to a prefix/exact match on role, or keep only name+email search.

## Coverage

Covered: admin-gating (page-level + API-level), `GET /api/users` (auth, role/search filters, `_count`, validation gaps), `PATCH /api/users/[userId]` (async params pattern ✓, admin check ✓, 404 handling ✓, self-demotion gap), `updateUser` server action (FormData coercion bug, revalidation), `updateUserSchema` (nullable schoolLevel ✓, department bounds, name surface), `UsersPage` server-side fetch + role guard, `UsersClient` (client search, edit state), `UserTable` (desktop/mobile, badges, row click to edit), `EditUserModal` ("use client" ✓, state reset on user change, role/department/schoolLevel inputs, toast, save flow).
Not covered (out of scope): `Avatar`/`Badge`/`Modal`/`Select`/`Input` primitives, `useToast` internals, sidebar nav role-gating (cross-cutting), deletion flow (not in spec).
