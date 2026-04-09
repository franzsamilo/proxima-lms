## 17. Cross-cutting Concerns
**What it should do:** App-wide compliance with Next.js 16 async patterns (params, searchParams, request APIs), correct server/client boundary, middleware matcher per spec, sidebar routes resolvable, landing page matching design spec, no dead files, and no legacy Link behavior or unintentional caching.

### Summary
The codebase is largely compliant with Next.js 16 mandates. All 13 dynamic route files type `params` as `Promise<...>` and no sync `params: { ... }` access was found. No uses of `cookies()`, `headers()`, `draftMode()`, `legacyBehavior`, `"use cache"`, `force-static`, or `revalidate` exist anywhere under `src/`. All React-hook-using files carry `"use client"`; all `@/lib/prisma` imports live in server files (layouts, pages, actions, API routes), never in a `"use client"` file. Findings below are minor.

---

### [LOW] Middleware and layout reference `icon.svg` while CLAUDE.md spec says `logo.svg`
- **Feature:** Cross-cutting / Middleware + Landing branding
- **Location:**
  - `src/middleware.ts:34` — `matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"]`
  - `src/app/layout.tsx:30-32` — `icons: { icon: "/icon.svg", apple: "/icon.svg" }`
  - `public/` contains `icon.svg` (no `logo.svg`)
- **Roles affected:** All
- **Expected (per CLAUDE.md):** Middleware matcher and public asset named `logo.svg`: `matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"]`.
- **Actual:** Project uses `icon.svg` consistently (file exists, matcher excludes it, root layout references it). This is internally consistent and functional, but diverges from the spec filename. No runtime impact — flagged for spec parity only.

### [LOW] Middleware uses `getToken` directly instead of `auth()` wrapper from `@/lib/auth`
- **Feature:** Cross-cutting / Middleware
- **Location:** `src/middleware.ts:1-7`
- **Roles affected:** All protected routes
- **Expected (per CLAUDE.md):** `import { auth } from "@/lib/auth"` and `export default auth((req) => { const isLoggedIn = !!req.auth; ... })`.
- **Actual:** Middleware calls `getToken({ req, secret: process.env.AUTH_SECRET })` directly. This works (JWT session strategy is configured) and avoids pulling Prisma into edge runtime, but deviates from the documented pattern. If `AUTH_SECRET` env var is ever renamed (e.g., to `NEXTAUTH_SECRET` in a future upgrade), this call silently returns null and everyone becomes logged-out.

### [LOW] Dead file: `src/hooks/use-current-user.ts`
- **Feature:** Cross-cutting / Dead code
- **Location:** `src/hooks/use-current-user.ts`
- **Roles affected:** None (unused)
- **Expected:** Either imported by client components that need the current user, or removed.
- **Actual:** Declared and marked `"use client"` but zero importers anywhere in `src/`. Current-user data is instead passed via props from the server dashboard layout. Safe to delete.

### [LOW] Spec component files missing: `mobile-nav.tsx`, `hooks/use-current-user` (as intended consumer)
- **Feature:** Cross-cutting / Directory spec drift
- **Location:** `src/components/layout/` (only `sidebar.tsx`, `topbar.tsx`)
- **Expected (per CLAUDE.md):** `src/components/layout/mobile-nav.tsx` as a separate client slide-over component.
- **Actual:** Mobile nav logic is folded into `sidebar.tsx` (it renders both desktop and mobile overlay) driven by `mobileOpen` prop from `dashboard-shell.tsx`. Functionally equivalent but structurally collapsed vs. the spec's three-file layout. Not a bug — note for refactor/consistency.

### [INFO] Landing page matches spec
- **Feature:** Cross-cutting / Landing
- **Location:** `src/app/page.tsx`
- Public server component. Dark `surface-0` bg. Proxima logo mark (rounded-2xl gradient "P"), "PROXIMA" h1 in Syne with `tracking-[6px]` and gradient-clipped text, "Robotics Learning Management System" subtitle, value prop, "Sign In" → `/login` + "Learn More" → `#features` CTAs, three feature cards (Integrated Hardware Kits, Code & Video Submissions, Curriculum Packages), footer. Compliant.

### [INFO] Sidebar nav items all resolve to real pages
- **Feature:** Cross-cutting / Routing reachability
- **Location:** `src/components/layout/sidebar.tsx:32-57`
- Verified routes exist under `src/app/(dashboard)/`: `dashboard/`, `courses/` (+ `new/`, `[courseId]/`, `[courseId]/edit/`), `tasks/` (+ `[taskId]/`), `grades/`, `calendar/`, `packages/`, `hardware/`, `users/`, `settings/`, plus `lessons/[lessonId]/`. Role gating (`TEACHER`/`ADMIN` for Hardware Kits; `ADMIN` for Users) matches spec. Every protected route in the middleware matcher is reachable from the sidebar or from drill-in pages.

### [INFO] Server/client boundary is clean
- **Feature:** Cross-cutting / RSC boundary
- All 43 files using React hooks (`useState`, `useEffect`, `useRef`, `usePathname`, `useSearchParams`, etc.) declare `"use client"`. All 3 hook files under `src/hooks/` declare `"use client"`. None of the 44 files importing `@/lib/prisma` are client components — every Prisma consumer is a server layout, page, action, or API route. No leakage found.

### [INFO] No legacy Next.js patterns present
- No `legacyBehavior` prop on `<Link>`, no `<a>` wrapped inside `<Link>`, no sync `cookies()`/`headers()`/`draftMode()` usage, no `"use cache"`/`force-static`/`export const revalidate` — app is fully Next.js 16 dynamic-by-default.

---

**Coverage:**
- Swept all 13 dynamic route files (`[courseId]`, `[moduleId]`, `[lessonId]`, `[taskId]`, `[userId]`) for async params — all compliant.
- Swept all page/layout/route files for `searchParams` usage — only client `useSearchParams()` (valid) and API route `new URL(request.url).searchParams` (valid); no page-prop `searchParams` anywhere.
- Grepped entire `src/` for `cookies()`, `headers()`, `draftMode()`, `legacyBehavior`, `"use cache"`, `force-static`, `revalidate =` — zero hits.
- Grepped all React hook imports and cross-referenced against `"use client"` directive — all 21 hook-importing files marked client.
- Grepped all 44 `@/lib/prisma` importers and confirmed none are client components.
- Read `src/middleware.ts`, `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/page.tsx`, `src/components/layout/sidebar.tsx`.
- Verified `public/` contents, `src/app/(dashboard)/` route tree, and sidebar nav-item → route correspondence for all 10 nav entries.
- Spot-checked potentially orphaned UI primitives: `data-table` (used ×3), `breadcrumb` (used ×3), `skeleton` (used ×1), `status-badge` (used ×2), `progress-bar` (used ×5) — all live. Only `src/hooks/use-current-user.ts` is orphaned.
