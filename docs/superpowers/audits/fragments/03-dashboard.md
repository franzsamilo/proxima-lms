## 3. Dashboard
**What it should do:** Role-adaptive stats grid (Student: Enrolled Courses, Pending Tasks, Average Grade, Progress; Teacher: Active Courses, Pending Reviews, Total Students, Completion Rate; Admin: Total Courses, Active Users, Hardware Kits, Packages) + announcements panel + recent activity + upcoming events; sidebar/topbar/mobile shell with role-gated nav.

### 🔴 BLOCKER: Topbar Missing Page Title
- **Feature:** Dashboard / Layout Shell
- **Location:** src/components/layout/topbar.tsx:95-196
- **Roles affected:** All
- **Expected (per CLAUDE.md):** Topbar left side displays "page title in Syne 15px weight-700, tracking 1px, `ink-primary`" (e.g., "Dashboard", "Courses", "Tasks")
- **Actual:** Topbar only renders mobile hamburger menu button on left; jumps directly to search/bell/avatar on right. No page title space/logic present.
- **Repro:** Load any dashboard page (e.g., /dashboard, /courses, /tasks). Observe topbar has blank left side; no page identifier.

### 🔴 BLOCKER: DashboardShell Missing Page Title Data Prop
- **Feature:** Dashboard Layout Shell
- **Location:** src/app/(dashboard)/dashboard-shell.tsx:16-20, src/components/layout/topbar.tsx:8-14
- **Roles affected:** All
- **Expected (per CLAUDE.md):** Topbar prop `pageTitle?: string` to receive current page name from layout/parent; Topbar renders it.
- **Actual:** DashboardShellProps interface has no pageTitle field. Topbar component has no pageTitle prop in TopbarProps. No data flow exists to pass page context from layout/page to topbar.
- **Repro:** No mechanism to inject page title into topbar. Spec requirement cannot be satisfied without prop addition.

### ⚪ NOTE: Announcements/Events Fetched in Layout (Non-blocking Pattern)
- **Feature:** Dashboard Layout
- **Location:** src/app/(dashboard)/layout.tsx:10-39
- **Roles affected:** All
- **Expected (per CLAUDE.md):** "Dashboard page is async and fetches per-role stats"; announcements should be in /dashboard page.
- **Actual:** Announcements and upcoming events fetched in layout.tsx, passed to DashboardShell for topbar notifications dropdown. Dashboard page re-fetches announcements for AnnouncementsPanel. This creates data duplication but enables topbar notifications feature not explicitly in spec.
- **Repro:** N/A — runtime behavior. Fetches are correct and data flows properly; spec is ambiguous on topbar notifications source.

---

## Verification Summary

**Compliant (spec-aligned):**
- Dashboard page is `async` (line 163); redirects unauthenticated users (line 165).
- Role-adaptive stats: `getStudentStats()` (9-48), `getTeacherStats()` (50-86), `getAdminStats()` (88-103) with correct metrics.
  - Student: Enrolled Courses ✓, Pending Tasks ✓, Average Grade ✓, Progress ✓
  - Teacher: Active Courses ✓, Pending Reviews ✓, Total Students ✓, Completion Rate ✓
  - Admin: Total Courses ✓, Active Users ✓, Hardware Kits ✓, Packages ✓
- AnnouncementsPanel orders by `createdAt desc` ✓ (layout.tsx:11, dashboard/page.tsx:177)
- RecentActivity and UpcomingEvents components present and rendered (dashboard/page.tsx:207-213)
- Sidebar logo: Syne gradient "PROXIMA" + JetBrains Mono "ROBOTICS LMS" subtitle ✓ (sidebar.tsx:65-85)
- Sidebar active nav state: `signal-muted` bg + `signal` text + 3px left bar ✓ (sidebar.tsx:122-128)
- Sidebar role gating: Hardware Kits → ["TEACHER", "ADMIN"] ✓ (sidebar.tsx:47), Users → ["ADMIN"] ✓ (sidebar.tsx:53)
- Topbar height 60px ✓ (topbar.tsx:96: `h-[60px]`)
- Topbar search bar 240px wide ✓ (topbar.tsx:120: `w-60` = 240px), 16px Search icon ✓
- Topbar notification bell 18px ✓ (topbar.tsx:136: `Bell size={18}`), 7px danger dot ✓ (topbar.tsx:138)
- Topbar user avatar 32px ✓ (topbar.tsx:193: `size={32}`)
- Mobile hamburger present on topbar <md ✓ (topbar.tsx:99-105: `lg:hidden`)
- DashboardShell "use client" ✓; Sidebar "use client" ✓; Topbar "use client" ✓; Layout async (no "use client") ✓
- DashboardShell renders Sidebar, Topbar, main with children ✓ (dashboard-shell.tsx:28-35)

**Total findings:** 2 BLOCKER, 0 BUG, 0 POLISH, 1 NOTE
