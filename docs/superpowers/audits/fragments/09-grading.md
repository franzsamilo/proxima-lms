## 9. Grading
**What it should do:** Teacher/admin can grade a submitted task with score+feedback; submission transitions to GRADED with `gradedAt` timestamp; grading form is only shown to teachers/admins on ungraded submissions; page revalidates after grading.

### [LOW] API route does not enforce STUDENT-only block via role enum check
- **Feature:** Grading
- **Location:** src/app/api/tasks/[taskId]/grade/route.ts:16-19
- **Observed:** Authorization is implemented as `if (userRole === "STUDENT") return 403`. Any other value (including unexpected/null role strings) would be treated as authorized.
- **Expected:** Spec says "Requires teacher/admin role". Should use a positive allow-list (e.g., `if (!["TEACHER","ADMIN"].includes(userRole))`) consistent with the server action that uses `requireRole(["TEACHER","ADMIN"])` (src/actions/grading-actions.ts:10).
- **Impact:** Currently low because role values are constrained by the auth callback, but defense-in-depth is weaker than the server action path.

### [LOW] API route does not call revalidatePath after grading
- **Feature:** Grading
- **Location:** src/app/api/tasks/[taskId]/grade/route.ts:55-65
- **Observed:** PATCH handler updates the submission and returns JSON with no `revalidatePath` calls. The server action `gradeSubmission` does revalidate `/tasks`, `/tasks/[id]`, `/grades`, `/courses`, `/dashboard` (src/actions/grading-actions.ts:37-41).
- **Expected:** Spec says "After grade, page refreshes / revalidatePath". If any client uses the REST endpoint instead of the server action, cached RSC pages will be stale.
- **Impact:** Inconsistency between two grading paths. Currently the in-app grading-form uses the server action, so observed behavior is correct, but the API route is a divergent code path.

### [LOW] API route does not block re-grading already-graded submissions
- **Feature:** Grading
- **Location:** src/app/api/tasks/[taskId]/grade/route.ts:21-66
- **Observed:** No status check before update — a submission already in `GRADED` state can be re-graded via PATCH. The page only renders the grading form when `status === "SUBMITTED"` (src/app/(dashboard)/tasks/[taskId]/page.tsx:61), so the UI is gated, but the API and the server action (src/actions/grading-actions.ts:25) are not.
- **Expected:** Either explicitly allow re-grading (and document it) or reject when status !== `SUBMITTED`. Spec wording "shown to teachers on ungraded submissions" suggests one-shot grading.
- **Impact:** Silent overwrite of prior grades/feedback if the action/API is invoked directly. `gradedAt` would also be refreshed each time.

### [INFO] Form does not surface field-level Zod errors
- **Feature:** Grading
- **Location:** src/components/tasks/grading-form.tsx:28-37
- **Observed:** When the action returns `{ error: fieldErrors }` (object), the form shows a generic toast "Validation failed. Check the grade and feedback fields." It does not display per-field errors.
- **Expected:** Minor UX issue; spec does not require field-level rendering. HTML5 `min/max/required` on the input mostly prevents the case.
- **Impact:** Cosmetic.

### [INFO] Empty feedback string is persisted instead of null
- **Feature:** Grading
- **Location:** src/actions/grading-actions.ts:18-32
- **Observed:** `formData.get("feedback") ?? undefined` — but `FormData.get` for an empty textarea returns `""` (not null), so Zod parses `""` as a valid optional string and Prisma writes `feedback: ""`. The PATCH route has the same behavior (passes `parsed.data.feedback` directly).
- **Expected:** Likely benign. If downstream code distinguishes empty vs null feedback, this could matter.
- **Impact:** Cosmetic / data hygiene.

### Verified correct
- Async params awaited correctly: `props: { params: Promise<{ taskId: string }> }` then `await props.params` (src/app/api/tasks/[taskId]/grade/route.ts:8-10). ✓
- `gradedAt: new Date()` set on update in BOTH the PATCH route (line 61) and the server action (src/actions/grading-actions.ts:31). ✓ (the "common bug spot" flagged in the prompt is not present)
- `status: "GRADED"` transition set in both paths. ✓
- `gradeTaskSchema` matches spec (grade int 0–100, feedback optional max 2000) — src/lib/validations.ts:51-54. ✓
- Teacher ownership check on PATCH: only the course's instructor (or ADMIN) can grade (src/app/api/tasks/[taskId]/grade/route.ts:38-43). ✓
- Grading form is `"use client"` (src/components/tasks/grading-form.tsx:1) and only rendered when `isTeacherOrAdmin && submission.status === "SUBMITTED"` (src/app/(dashboard)/tasks/[taskId]/page.tsx:60-91). ✓
- Server action calls `revalidatePath` for `/tasks`, `/tasks/[id]`, `/grades`, `/courses`, `/dashboard` and additionally updates enrollment progress via `updateEnrollmentProgress`. ✓
- Client form disables submit while pending and shows success/error toast (src/components/tasks/grading-form.tsx:81-83, 33-39). ✓

**Coverage:** src/app/api/tasks/[taskId]/grade/route.ts, src/actions/grading-actions.ts, src/components/tasks/grading-form.tsx, src/lib/validations.ts (gradeTaskSchema), src/app/(dashboard)/tasks/[taskId]/page.tsx (gating context).
