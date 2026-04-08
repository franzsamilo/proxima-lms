## 4. Courses (Read)
**What it should do:** Role-scoped course listing + course detail page with nested modules → lessons tree.

### 🔴 BLOCKER: Courses list page bypasses API and ignores level/search query params
- **Feature:** Courses (Read)
- **Location:** src/app/(dashboard)/courses/page.tsx:24-52
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** `GET /api/courses` is the role-scoped lister and supports `?level=` and `?search=` query params. Courses page should honor those filters (or consistently use the API).
- **Actual:** The page queries Prisma directly with role filtering. The `?level=` and `?search=` filters supported by the API route are not passed through or applied at the page level, so users have no way to invoke them via the UI.
- **Repro:** Visit `/courses?level=COLLEGE&search=robotics` — filters have no effect.
- **Notes:** Either remove the unused query params from the API or wire them through the page's `searchParams`. The dual fetch path (page → Prisma direct, API → also Prisma) is also a SSOT smell.

### 🔵 POLISH: Module accordion chevron rotates 180° instead of 90°
- **Feature:** Courses (Read) — Module accordion
- **Location:** src/components/courses/module-accordion.tsx:53-58
- **Roles affected:** ALL
- **Expected (per CLAUDE.md "Module Accordion"):** chevron rotates 90° when expanded, 200ms transition.
- **Actual:** Uses `rotate-180` class. Transition timing (200ms) is correct.
- **Notes:** Cosmetic; not functionally broken.

### ⚪ NOTE: Hydration / async params behavior at runtime
- **Feature:** Courses (Read)
- **Location:** runtime
- **Roles affected:** ALL
- **Notes:** Static review confirms `await props.params` is used in dynamic routes. Hydration warnings, devtools errors, and Monaco/quiz mount issues require runtime verification — deferred per code-only audit fallback.

---

**Coverage:** code-audited src/app/(dashboard)/courses/page.tsx, src/app/(dashboard)/courses/[courseId]/page.tsx, src/app/api/courses/route.ts, src/app/api/courses/[courseId]/route.ts, course-card.tsx, course-list.tsx, module-accordion.tsx, lesson-item.tsx, course-timeline.tsx; runtime checks deferred.
