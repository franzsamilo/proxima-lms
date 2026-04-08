## Coverage Appendix

Legend: ✓ audited, no role-specific finding · ⚠ audited, has finding affecting that role · 🚫 not applicable / blocked by design.

### Pages

| Route | Student | Teacher | Admin |
|---|---|---|---|
| `/` | ✓ | ✓ | ✓ |
| `/login` | ⚠ | ⚠ | ⚠ |
| `/register` | ⚠ | ⚠ | 🚫 |
| `/dashboard` | ⚠ | ⚠ | ⚠ |
| `/courses` | ⚠ | ⚠ | ⚠ |
| `/courses/new` | 🚫 | ⚠ | ⚠ |
| `/courses/[courseId]` | ⚠ | ⚠ | ⚠ |
| `/courses/[courseId]/edit` | 🚫 | ⚠ | ⚠ |
| `/lessons/[lessonId]` | ⚠ | ✓ | ⚠ |
| `/tasks` | ⚠ | ⚠ | ⚠ |
| `/tasks/[taskId]` | ⚠ | ⚠ | ⚠ |
| `/grades` | ✓ | ⚠ | ⚠ |
| `/calendar` | ⚠ | ⚠ | ⚠ |
| `/packages` | ⚠ | ⚠ | ⚠ |
| `/hardware` | 🚫 | ⚠ | ⚠ |
| `/users` | 🚫 | 🚫 | ⚠ |
| `/settings` | ⚠ | ⚠ | ⚠ |

### API routes

| Route | Methods | Audited |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | ✓ |
| `/api/auth/register` | POST | ⚠ |
| `/api/courses` | GET/POST | ⚠ |
| `/api/courses/[courseId]` | GET/PATCH/DELETE | ⚠ |
| `/api/courses/[courseId]/enroll` | POST | ✓ |
| `/api/courses/[courseId]/modules` | POST | ✓ |
| `/api/modules/[moduleId]` | PATCH/DELETE | ⚠ |
| `/api/modules/[moduleId]/lessons` | POST | ✓ |
| `/api/lessons/[lessonId]` | GET/PATCH | ⚠ |
| `/api/tasks` | GET/POST | ⚠ |
| `/api/tasks/[taskId]` | GET | ⚠ |
| `/api/tasks/[taskId]/grade` | PATCH | ⚠ |
| `/api/packages` | GET | ⚠ |
| `/api/hardware` | GET | ⚠ |
| `/api/hardware/assign` | POST | ⚠ |
| `/api/users` | GET | ⚠ |
| `/api/users/[userId]` | PATCH | ⚠ |
| `/api/calendar` | GET/POST | ⚠ |
| `/api/announcements` | GET/POST | ⚠ |

### Files-not-touched

- `src/app/api/uploadthing/core.ts`, `src/app/api/uploadthing/route.ts` — out of scope; no fragment dedicated to upload pipeline. Spec reference exists but no audit task targeted these handlers.
- UI primitives under `src/components/ui/` (`button`, `card`, `badge`, `modal`, `input`, `select`, `textarea`, `data-table`, `tabs`, `progress-bar`, `toast`, `avatar`, `grade-circle`, `status-badge`, `skeleton`, `confirmation-dialog`) — referenced transitively by feature audits but not individually inspected.
- `src/lib/uploadthing.ts` — companion to uploadthing API; same reason.
- `src/components/hardware/kit-form-modal.tsx`, `src/components/hardware/assign-kit-trigger.tsx`, `src/components/hardware/hardware-client.tsx` — touched in passing by fragment 13 but not full-file audited.
- Mobile runtime sweep (fragment 18) — deferred per code-only fallback (spec §3).
