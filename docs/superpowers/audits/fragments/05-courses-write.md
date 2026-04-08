## 5. Courses (Write)
**What it should do:** Role-gated create/edit/delete for courses + student self-enroll.

### 🔴 BLOCKER: Server Action createCourse missing isPublished: false
- **Feature:** Courses (Write) — Create
- **Location:** src/actions/course-actions.ts:23-28
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md):** createCourse must auto-set `isPublished: false` per spec table row 1214
- **Actual:** Server action creates course without setting `isPublished: false`. Only the `POST /api/courses` route (line 83) sets it. Server action omits it, relying on Prisma default, which may cause inconsistency if default changes.

**Impact:** Courses created via server action may not match spec contract. API route behaves correctly.

---

### 🟡 BUG: API route PATCH /api/courses/[courseId] lacks input validation
- **Feature:** Courses (Write) — Update
- **Location:** src/app/api/courses/[courseId]/route.ts:74-78
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md):** PATCH should validate input with `createCourseSchema.partial()` (per Server Actions pattern, line 1245-1272 of CLAUDE.md)
- **Actual:** `const body = await request.json()` → `data: body` passed directly to Prisma without validation. Allows arbitrary field mutation (e.g., `instructorId`, `createdAt`, `tier`).

**Impact:** Authorization is enforced (instructorId check present), but no schema validation. Instructor could mutate unintended fields like `tier` or `maxStudents` directly.

---

### ✅ PASS: POST /api/courses validates schema and sets defaults
- **Location:** src/app/api/courses/route.ts:57-87
- **Correct:** Validates `createCourseSchema`, checks role (TEACHER/ADMIN), auto-sets `instructorId`, `tier`, `isPublished: false` per spec.

---

### ✅ PASS: DELETE /api/courses/[courseId] cascades correctly
- **Location:** src/app/api/courses/[courseId]/route.ts:106
- **Correct:** Uses Prisma `delete()` which triggers cascade via schema (`Module` and `Enrollment` both have `onDelete: Cascade`).

---

### ✅ PASS: POST /api/courses/[courseId]/enroll enforces constraints
- **Location:** src/app/api/courses/[courseId]/enroll/route.ts:5-53
- **Correct:** Checks `maxStudents` (line 29), prevents duplicate (line 34-42), creates Enrollment with `progress: 0` (line 48).

---

### ✅ PASS: Edit page awaits async params
- **Location:** src/app/(dashboard)/courses/[courseId]/edit/page.tsx:10-13
- **Correct:** `props: { params: Promise<{ courseId: string }> }` then `await props.params` per Next.js 16 pattern.

---

### ✅ PASS: CreateCourseForm is "use client" and integrates correctly
- **Location:** src/components/courses/create-course-form.tsx:1
- **Correct:** `"use client"` directive, uses `useActionState`, dispatches to `createCourse` or `updateCourse` actions, handles field errors.

---

### ⚪ NOTE: Date transformation via createCourseSchema
- **Location:** src/lib/validations.ts:25-26
- **Note:** Schema transforms `startDate` and `endDate` strings to `Date` objects. Form sends strings (type="date"). Server action and API both accept strings — schema handles transform. Matches spec pattern (line 1258-1265 of CLAUDE.md).

---

## Summary
**Findings:** 1 BLOCKER, 1 BUG, 5 PASS, 1 NOTE

**BLOCKER:** Server action `createCourse` must explicitly set `isPublished: false` to match API route and spec.  
**BUG:** PATCH route needs schema validation to prevent field injection.

All async params correctly awaited. Role checks and authorization working. Cascade deletions verified in schema.
