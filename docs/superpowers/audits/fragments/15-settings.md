# 15 — Settings (Profile + Password) Audit

Scope: `src/app/(dashboard)/settings/page.tsx`, `src/actions/settings-actions.ts`, `src/components/settings/settings-client.tsx`. Supporting context consulted: `src/lib/auth-helpers.ts`, `src/lib/validations.ts`, `src/app/api/auth/register/route.ts` (for bcrypt cost parity), `src/middleware.ts`.

Coverage: page-level auth gating, profile update server action, password change server action (current-password verification, bcrypt cost, update), client form state/submission, input validation parity with spec. Not in scope: session refresh after profile name change, email change flow (spec says email is not changeable — confirmed in UI).

Severity legend: P0 (correctness/security), P1 (spec drift / UX bug), P2 (polish / consistency), P3 (nit).

---

## P1 — Profile and password server actions bypass Zod validation entirely

File: `src/actions/settings-actions.ts` lines 8–28 (`updateProfile`), lines 30–65 (`changePassword`).

The spec ("Inputs validated (Zod schemas)") and the rest of the codebase funnel mutations through Zod schemas in `src/lib/validations.ts`. `settings-actions.ts` imports no schema and hand-rolls ad-hoc checks:

- `updateProfile` only checks `name.length >= 2`. No max length (Prisma will accept arbitrarily long strings up to column limit; spec `updateUserSchema` sets `name: z.string().min(2)` but no max either — still, department has no bound at all and is trimmed straight into the DB).
- `changePassword` checks presence, `newPassword.length >= 6`, and `newPassword === confirmPassword`. It does not enforce `newPassword !== currentPassword` (users can "change" to the same password), does not cap length, and does not reject whitespace-only strings (a string of 6 spaces passes).
- Neither action type-guards `formData.get(...)` — the `as string | null` casts will silently coerce `File` entries to `"[object File]"` if anyone ever attaches one.

Recommend adding `updateProfileSchema` and `changePasswordSchema` to `src/lib/validations.ts` (reusing the same `min(6)` policy as `registerSchema`, adding a `.refine()` for `new !== current`, and a max length like 72 for bcrypt's effective input ceiling). Wire them with `.safeParse()` as the other actions do. Without this, settings is the only mutation surface in the app that drifts from the established validation pattern.

## P1 — Spec's "department" field for profile is editable by students, but students have no department in the data model flow

File: `src/components/settings/settings-client.tsx` lines 137–151; `prisma/schema.prisma` (User model).

The spec lists the profile form as "name, email, department" for all users. The schema has `department String?` on `User`, but `registerSchema` in `validations.ts` only collects `department` implicitly (actually not at all — it only collects `schoolLevel` for students). In the seed, only the TEACHER has a department set; students have `schoolLevel`. The settings page exposes a `department` input to *every* logged-in user with no role branching, so a student can set "Robotics Engineering" as their department and it will persist — but nothing else in the app reads students' department. Meanwhile `schoolLevel` (which *is* rendered on the users admin table and used by the dashboard) is not editable here at all. Net: settings lets students edit a field that is meaningless for them and hides the field that matters. Recommend either (a) role-branch the form (students see `schoolLevel`, teachers see `department`, admins see both), or (b) explicitly document that department is a free-text field for all roles and drop `schoolLevel` editing from scope.

## P1 — Name change does not refresh the JWT session; sidebar/topbar keep stale name

File: `src/actions/settings-actions.ts` lines 18–27; `src/lib/auth.ts` (jwt/session callbacks).

`updateProfile` mutates the DB and calls `revalidatePath("/settings")`, but the user's name lives on the JWT token (populated once in the `jwt` callback on sign-in — see `auth.ts`). Because `session: { strategy: "jwt" }`, subsequent renders of `<Sidebar>` / `<Topbar>` (which typically read from the session) will keep the pre-change name until the user signs out and back in. The action also doesn't `revalidatePath("/", "layout")` to force a re-render of layout-level server components that may have cached the `getCurrentUser()` result. Two fixes are possible: (1) trigger `unstable_update` from `next-auth` (v5 supports mutation via `auth.update(...)`), or (2) widen the revalidation to the dashboard layout. Minimum: document the known limitation and add a toast note like "Some areas may not reflect the new name until you sign in again."

## P1 — `updateProfile` does not revalidate the layout, so the sidebar user block stays stale even for server-rendered paths

File: `src/actions/settings-actions.ts` line 26.

Related to the JWT issue above but distinct: `revalidatePath("/settings")` only invalidates the settings page. `(dashboard)/layout.tsx` (per CLAUDE.md) fetches `getCurrentUser()` and renders the sidebar user block with the name. Since the layout is not revalidated, navigating to another dashboard page after saving will still show the old name (even beyond the JWT staleness — because Next caches the RSC). Recommend `revalidatePath("/", "layout")` or at minimum `revalidatePath("/dashboard", "layout")`.

## P2 — Password change does not invalidate other sessions or log the user out

File: `src/actions/settings-actions.ts` lines 57–64.

After a successful password change the action returns `{ success: true }` and leaves all existing sessions active. Best-practice (and what most users expect) is to either (a) force a re-login in the current tab, or (b) invalidate all `Session` rows for the user. With `session: { strategy: "jwt" }` there's no DB session to delete, but the action could at minimum call `signOut({ redirectTo: "/login" })` from the client after success, or set a `passwordChangedAt` timestamp on the user and check it in the `jwt` callback. Flagging as P2 because this is not strictly called out in the spec, but it is the kind of thing a security-conscious reviewer will ask about.

## P2 — No rate limiting on `changePassword`; current-password check is an oracle

File: `src/actions/settings-actions.ts` lines 52–55.

An authenticated attacker (e.g., session cookie stolen but password unknown) can brute-force the current password via repeated `changePassword` calls — the action returns distinct error messages ("Current password is incorrect.") with no throttle, no attempt counter, no delay. bcrypt cost 12 provides some implicit slowdown but not enough to stop a scripted attack. Recommend adding at least a simple in-memory or DB-backed attempt counter per user-id, or using a constant-time delay on failure. Again not in the spec but worth noting.

## P2 — Email field is `disabled` + `readOnly` + `defaultValue`, which is fine, but there's no server-side guarantee

File: `src/components/settings/settings-client.tsx` lines 124–131; `src/actions/settings-actions.ts` lines 8–28.

The UI disables the email input, which is good UX — but `updateProfile` on the server never reads `email` from the form anyway, so the guarantee comes from the action's field allowlist, not from the disabled attribute. That's actually correct defense-in-depth, but worth explicitly commenting in the action ("intentionally does not accept email — users cannot change their email") so a future contributor doesn't add `email: formData.get("email")` out of symmetry.

## P2 — `changePassword` returns `{ success: true }` but does not `revalidatePath`

File: `src/actions/settings-actions.ts` line 64.

Unlike `updateProfile`, the password action does not call `revalidatePath`. Not strictly required (no rendered data changes), but inconsistent. Harmless.

## P2 — Client form handles pending state manually instead of using `useActionState` / `useFormStatus`

File: `src/components/settings/settings-client.tsx` lines 27, 33, 45–61, 63–83.

Both forms use hand-managed `React.useState` pending flags and build `FormData` imperatively. Next.js 16 / React 19 ship `useActionState` (formerly `useFormState`) + `useFormStatus` which are the idiomatic path for progressive-enhancement and also solve the `action={}` + JS-disabled case. The rest of the codebase may or may not use these (not in scope here), but this component predates them. Purely a modernization note.

## P2 — `useUnsavedChanges` considers a filled-in current-password field as "dirty" and will warn on navigation even if the user did nothing else

File: `src/components/settings/settings-client.tsx` lines 37–43.

Any keystroke in the password fields flips `isDirty` true, which triggers the unsaved-changes prompt on navigation. If the user starts typing a password, abandons it, and clicks another nav item, they'll see a beforeunload warning. That's defensible, but it couples "unsaved profile edits" with "half-entered password" — arguably they should be tracked independently so the warning only fires for the profile section. Minor.

## P2 — Toasts not cleared on unmount; no aria-live region verified

File: `src/components/settings/settings-client.tsx` line 232 (`<Toast {...toastProps} />`).

Not in scope of this fragment (the `Toast` component is shared), but noting that success toasts after password change do not dismiss the password form's own "success" state — the form just clears inputs. If the user mis-clicks and the page unmounts during the toast, the toast disappears. Cross-ref with the toast audit (likely in cross-cutting sweep).

## P3 — Page-level auth check duplicates middleware

File: `src/app/(dashboard)/settings/page.tsx` lines 7–8.

`if (!user) redirect("/login")` is belt-and-suspenders with `src/middleware.ts` (which already gates `/settings`). Consistent with other pages in the codebase, but worth noting: if middleware is ever relaxed or the matcher changes, this page-level check is the only safety net — which is actually an argument for keeping it. Flagging only to note the redundancy exists intentionally.

## P3 — `initialDepartment` falls back to empty string, losing null semantics

File: `src/app/(dashboard)/settings/page.tsx` line 19; `src/actions/settings-actions.ts` line 22.

The page passes `user.department ?? ""` into the client, the action then maps `department || null` back to null on save. Round-trip is lossless, but an empty string submitted by a user who never had a department set will result in an update no-op (null → null), which is fine. Nit: nothing to fix.

## P3 — No max-width on the Name / Department inputs beyond the container's `max-w-2xl`

File: `src/components/settings/settings-client.tsx` line 86.

Cosmetic: on very wide screens the inputs stretch to ~672px which matches other forms in the app. Consistent.

## P3 — Settings page has no `loading.tsx` shown content-wise, but `loading.tsx` exists

File: `src/app/(dashboard)/settings/loading.tsx` (present, not read in this audit).

Noted for completeness — loading skeleton exists, which matches the spec's "13. Polish" step.

---

## Positive findings

- Page is properly auth-gated (`getCurrentUser()` + redirect).
- Both server actions begin with `requireAuth()` and only ever write `where: { id: sessionUser.id }` — **no privilege escalation vector**. A caller cannot target another user's row. This is the single most important security property for this surface, and it holds.
- `changePassword` correctly verifies the current password with `bcrypt.compare` before hashing the new one with `bcrypt.hash(newPassword, 12)` — **cost parity with `src/app/api/auth/register/route.ts`** (also cost 12). Both the current-password verification and the cost match the spec.
- Email is not accepted by `updateProfile` at all — the field allowlist on the server prevents the most common "user changes their email to someone else's" class of bug, independent of the disabled UI.
- Password fields use `PasswordInput` with `autoComplete="current-password"` / `new-password`, which is the correct hint for browser password managers.
- `confirmPassword` is validated server-side (not trusted client-side alone).
- Client clears password fields on success; does not echo them back into the DOM.
- Form uses `Card` / typography tokens consistent with the Observatory design system.
