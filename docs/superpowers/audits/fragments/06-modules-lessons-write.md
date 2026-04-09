## 6. Modules & Lessons (Write)
**What it should do:** Teacher/admin-gated CRUD for course modules and their lessons via server actions and JSON API routes, with auto-ordering and Zod validation.

### 🔵 POLISH: PATCH `/api/modules/[moduleId]` lacks `revalidatePath` after mutation
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/api/modules/[moduleId]/route.ts (PATCH handler)
- **Roles affected:** TEACHER, ADMIN
- **Expected (per CLAUDE.md Server Actions pattern):** mutating endpoints should `revalidatePath()` so consumer pages refresh.
- **Actual:** Mutation succeeds but no path revalidation, so course detail pages may show stale data until next dynamic render.
- **Notes:** Same issue applies to PATCH `/api/lessons/[lessonId]`.

### 🔵 POLISH: PATCH `/api/lessons/[lessonId]` lacks `revalidatePath` after mutation
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/api/lessons/[lessonId]/route.ts (PATCH handler)
- **Roles affected:** TEACHER, ADMIN
- **Expected:** Mutations call `revalidatePath()` so the lesson viewer + course pages refresh.
- **Actual:** No revalidation call observed.

### 🔵 POLISH: PATCH route bodies accept arbitrary fields (no Zod validation)
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/api/modules/[moduleId]/route.ts and src/app/api/lessons/[lessonId]/route.ts (PATCH handlers)
- **Roles affected:** TEACHER, ADMIN
- **Expected:** All write endpoints validate inbound payloads with the relevant Zod schema (server actions do).
- **Actual:** PATCH handlers spread the request body into `prisma.update`. Form-driven actions validate, but anyone calling the API directly bypasses schema checks.
- **Notes:** Tighten with a partial schema (`createModuleSchema.partial()` / `createLessonSchema.partial()`).

### ⚪ NOTE: Module/lesson creation UI exists in edit page only
- **Feature:** Modules & Lessons (Write)
- **Location:** src/app/(dashboard)/courses/[courseId]/edit/* (forms exist), course detail page (no inline create)
- **Notes:** Spec doesn't strictly require inline creation on the read page, so this is informational.

---

**Coverage:** code-audited module-actions.ts, lesson-actions.ts, validations.ts (createModuleSchema/createLessonSchema), api/courses/[courseId]/modules/route.ts, api/modules/[moduleId]/route.ts, api/modules/[moduleId]/lessons/route.ts, api/lessons/[lessonId]/route.ts, plus the related edit-page forms. Auth checks (`requireRole`) and async params awaited correctly. Cascade deletes verified via Prisma schema (`onDelete: Cascade`). Auto-ordering (`max + 1`) verified. Runtime checks deferred.
