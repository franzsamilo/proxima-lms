# Proxima LMS — Tester Guide

A practical walkthrough for QA. Each section is a short scenario with checkboxes — tick what works, leave a note next to anything that doesn't. Bug template at the bottom.

---

## 1. Setup

### Prerequisites
- Node.js 18+
- A reachable PostgreSQL database (Supabase recommended)
- `.env` file with `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (≥32 chars), `UPLOADTHING_TOKEN`

### First-time setup
```bash
git clone https://github.com/franzsamilo/proxima-lms.git
cd proxima-lms
npm install
cp .env.example .env     # then fill in real values
npx prisma migrate deploy
npx prisma db seed       # dev seed creates demo accounts + sample data
npm run dev
```
Open http://localhost:3000.

### Demo accounts (dev only)

Password for all: **`password123`**

| Role     | Email                          | Notes                                      |
|----------|--------------------------------|--------------------------------------------|
| Teacher  | elena@proxima.edu              | Owns all 3 sample courses                  |
| Student  | marcus@student.proxima.edu     | Enrolled in all 3, has graded submissions  |
| Student  | aisha@student.proxima.edu      | Enrolled in Robot Programming (HS)         |
| Student  | jake@student.proxima.edu       | Enrolled in Intro to Robotics (Elementary) |
| Admin    | admin@proxima.edu              | Full access; *not* shown on login page     |

> The admin account is no longer auto-listed on `/login` — that panel hides in production. Verify by setting `NODE_ENV=production` locally if needed.

---

## 2. Auth flows

### 2.1 Sign in
- [ ] `/login` shows the form with **Email** and **Password** labels (plain English, not "Operator ID")
- [ ] Wrong credentials show "Wrong email or password"
- [ ] Correct credentials redirect to `/dashboard` — no blank page, no redirect loop
- [ ] Password field has show/hide eye icon
- [ ] "Create an account" link goes to `/register`
- [ ] In dev: a "DEMO ACCOUNTS · DEV ONLY" panel shows the two student/teacher demo accounts (no admin)

### 2.2 Sign up
- [ ] `/register` shows: full name, email, password, confirm, role toggle (Student/Teacher), school level (Student only)
- [ ] Submit with mismatched passwords → inline error
- [ ] Submit with existing email → "Email already registered" inline
- [ ] Successful submit auto-signs in and lands on `/dashboard`
- [ ] **Cannot register as ADMIN** — only Student/Teacher options exist (intentional)

### 2.3 Sign out
- [ ] In sidebar, lower-left, click the door icon next to your avatar
- [ ] You're sent back to `/login`
- [ ] Hitting browser back button does NOT show the cached dashboard

### 2.4 Session expiry / self-healing (important — production safety)
- [ ] Sign in successfully
- [ ] In DevTools → Application → Cookies → modify the value of `authjs.session-token` to garbage and reload
- [ ] You should be redirected to `/login?reason=session_expired` — NOT stuck in a loop
- [ ] The login page shows: *"Your session expired. Please sign in again."*
- [ ] Cookies are auto-cleared (verify in DevTools)

### 2.5 Rate limiting
- [ ] On `/login`, submit wrong credentials 9 times rapidly
- [ ] After ~8 attempts you should see: *"Too many sign-in attempts. Try again in Ns."*
- [ ] Wait the remaining time, retry — should be allowed

### 2.6 Route protection
- [ ] Open an incognito window, hit `/dashboard` directly → redirects to `/login?from=/dashboard`
- [ ] After signing in, you land on `/dashboard` (the original target)
- [ ] As STUDENT: hitting `/users` or `/hardware` redirects to `/dashboard`
- [ ] As TEACHER: `/users` redirects to `/dashboard`; `/hardware` works
- [ ] As ADMIN: every route accessible

---

## 3. Layout shell (sidebar + topbar + search + notifications)

### 3.1 Sidebar
- [ ] Three nav groups visible: **Learn**, **Resources**, **System**
- [ ] Items use plain words: Dashboard, Courses, Tasks, Grades, Calendar, Lesson Packages, Hardware Kits, Users, Settings
- [ ] Active item shows cyan left bar + cyan text
- [ ] Bottom shows your name + role + sign-out icon
- [ ] Top shows "Online" pip + UTC clock that ticks every second
- [ ] **Mobile (< 1024px)**: sidebar hidden; hamburger in topbar opens slide-in
- [ ] Tapping a nav item closes the mobile sidebar

### 3.2 Topbar
- [ ] Page title visible on the left (matches the route, e.g. "Dashboard", "Courses")
- [ ] Date pill on the right (e.g. "Sun, Mar 9")
- [ ] Search bar visible on desktop; search icon on mobile
- [ ] User avatar with hover ring

### 3.3 Search (NEW — fully working)
- [ ] Click the search bar OR press **⌘K** / **Ctrl+K** to focus
- [ ] Type at least 2 characters — dropdown appears
- [ ] Results are grouped by kind: COURSE, LESSON, PACKAGE, USER (admin only), KIT (teacher/admin only)
- [ ] **Keyboard nav**: `↑` / `↓` to highlight, `Enter` to open, `Esc` to close
- [ ] Click any result → navigates to the right page
- [ ] Type something with no matches → "No matches found for "..."
- [ ] As STUDENT: search returns only courses you're enrolled in (try searching for a term in a course you're NOT enrolled in — should not appear)
- [ ] As TEACHER: search returns only your taught courses
- [ ] As ADMIN: search returns all courses, lessons, users, kits, packages
- [ ] **Mobile**: tap search icon → full-width search bar opens; `Esc` or back arrow closes

### 3.4 Notifications (NEW — clickable)
- [ ] Bell icon in topbar with red dot when notifications exist
- [ ] Click bell → dropdown shows "Notifications" header with item count
- [ ] Each item is **clickable** (was previously read-only):
  - Announcement → goes to `/dashboard#announcement-{id}`
  - Event → goes to `/calendar?month=YYYY-MM#event-{id}`
- [ ] "View all in calendar →" link at the bottom
- [ ] Empty state shows "You're all caught up."
- [ ] Click outside the dropdown → closes
- [ ] Each notification shows friendly time: "Today" / "Tomorrow" / "3d ago" / "In 5d" (no `T+/T-` jargon)

---

## 4. Dashboard (per role)

### 4.1 Student dashboard (Marcus)
- [ ] Header: today's date + "Welcome back, Marcus." + a one-line summary
- [ ] **Skeleton panels paint in <1s** while data loads, then fill in
- [ ] Stats cards: Enrolled courses, Pending tasks, Average grade (`/100`), Overall progress (with progress bar)
- [ ] Announcements panel lists posts with priority badge + relative time
- [ ] Recent Activity shows submission timeline ("Submitted: …", "Graded: 92/100") with icons per lesson type
- [ ] Upcoming panel shows date chip (DAY + MON) + event title + days-until pill

### 4.2 Teacher dashboard (Elena)
- [ ] Stats: Your courses, Pending reviews, Students, Avg completion
- [ ] Recent Activity shows student submissions across her courses

### 4.3 Admin dashboard
- [ ] Stats: Total courses, Total users, Hardware kits, Lesson packages

---

## 5. Courses

### 5.1 Browse `/courses`
- [ ] Header: "Courses" + count
- [ ] Filter bar: search box, level dropdown (All / Elementary / High school / College), Filter button
- [ ] Submit filter — list updates; active filters appear as removable chips with a Clear link
- [ ] **Each card** shows: level badge, tier name, title, description, 3 stat boxes (Modules / Lessons / Students), instructor name. Student view also shows their progress bar.
- [ ] Empty filter result shows "No courses found"
- [ ] Hover a card → cyan glow; arrow icon nudges

### 5.2 Course detail `/courses/[id]`
- [ ] Header: title, level + tier badges, instructor, dates
- [ ] Module accordion expands/collapses; lesson rows are clickable
- [ ] **Student**: Enroll button if not enrolled; "Continue" or progress otherwise
- [ ] **Teacher (own course) / Admin**: Edit + Publish/Unpublish buttons visible

### 5.3 Create + edit (Teacher / Admin)
- [ ] `/courses/new` form: title, description, level, max students, start/end dates
- [ ] Submit creates the course → lands on detail page
- [ ] Validation errors render inline
- [ ] On `/courses/[id]/edit`:
  - Add module → appears in list
  - Add lesson → pick type (Slides / Code / Quiz / Task / Video / **Document**)
  - Reorder modules + lessons via up/down arrows
  - Delete module → cascades lessons (confirm dialog appears)
  - Delete lesson → confirm dialog (DELETE endpoint now exists)

---

## 6. Lessons (each type)

Open one of each type from the Intro to Robotics or Robot Programming course:

### 6.1 SLIDES
- [ ] Slide viewer renders markdown (bold, lists, code blocks)
- [ ] Prev/Next nav, slide counter
- [ ] If a file is also attached, the FileViewer renders below the slides ("Attached resource")

### 6.2 CODE
- [ ] Monaco editor loads with the skeleton, syntax highlighting on
- [ ] Brief + hints display above
- [ ] Submit code → "Submitted" feedback; reload page → previously submitted code restored
- [ ] **Memory check**: navigate between several CODE lessons in sequence — browser memory should NOT keep climbing (Monaco now disposes properly)

### 6.3 QUIZ
- [ ] Questions render with radio options
- [ ] Submit → grades shown per question
- [ ] After submission, can't change answers

### 6.4 TASK
- [ ] Brief + requirements + rubric table render
- [ ] Code textarea + video URL input
- [ ] Submit → confirmation; previously submitted state shows on reload

### 6.5 VIDEO
- [ ] Native video player with controls

### 6.6 DOCUMENT (NEW)
The new file viewer auto-detects the file kind and dispatches:

- [ ] **PDF**: in-browser viewer with page nav (`<` `>`), zoom (`+` `-`), fullscreen, download, open-in-new-tab. Page count visible. Search-indexable text.
- [ ] **DOCX (Word)**: parses to inline styled HTML. Preserves headings, lists, tables, images, links. Format-warning indicator if mammoth couldn't render some bits.
- [ ] **PPTX (PowerPoint)**: embeds Microsoft Office Online viewer in an iframe. Note: requires the file URL to be publicly reachable (UploadThing default).
- [ ] **Images** (png/jpg/gif/webp/svg): centered preview
- [ ] **Video** (mp4/webm/mov): native player
- [ ] **Audio** (mp3/wav/ogg): centered with title + audio controls
- [ ] **Markdown** (.md): rendered with ReactMarkdown + GFM
- [ ] **Plain text / source code** (.txt/.csv/.py/.js etc): monospace pre with up to 1MB limit
- [ ] **XLSX / archives / unknown**: shows "Preview not supported" + Download button
- [ ] All viewers wrap in a unified shell: file name, MIME badge, size, status pip, Fullscreen / Open in new tab / Download buttons in the toolbar

### 6.7 Document upload (Teacher / Admin)
- [ ] In the Edit Lesson modal, switch lesson type to **Document** (or pick a SLIDES lesson with optional attachment)
- [ ] Drag a file onto the dropzone OR click "Select file"
- [ ] Upload progress spinner shows; on complete the file card appears with name, MIME, size
- [ ] Replace icon → swap to a different file
- [ ] X icon → remove file
- [ ] Save lesson → reload → file persists

---

## 7. Tasks

### 7.1 List `/tasks`
- [ ] Page title: "Tasks" (student) or "Submissions" (teacher/admin)
- [ ] Subtitle shows pending + graded counts
- [ ] Tabs: All / Pending / Graded — filter URL updates
- [ ] Table columns (desktop): Lesson, Course, (Student — teacher view), Type, Status, Submitted, Grade
- [ ] Pagination appears past 10 items
- [ ] **Mobile**: table becomes card stack

### 7.2 Detail + grading `/tasks/[id]`
- [ ] Submission content renders (code block, video player, quiz answers grid)
- [ ] Already-graded submissions show grade circle + feedback
- [ ] **Teacher view, ungraded**: grading form with grade (0–100) and feedback textarea
- [ ] Submit grade → success toast → status flips to GRADED → student's grades page updates next visit

---

## 8. Grades `/grades`
- [ ] Header: "My grades" / "Class grades" / "All grades" by role
- [ ] Subtitle: "X graded · Average Y/100"
- [ ] Course summary cards (per course: avg grade, completion ratio)
- [ ] Grade table: lesson, course, type, grade circle, feedback preview, date
- [ ] Distribution chart on the right shows A/B/C/F bars
- [ ] **Mobile**: table becomes cards

---

## 9. Calendar `/calendar`
- [ ] Month grid with day cells; today highlighted in cyan
- [ ] Event dots colored by type (deadline=amber, exam=red, event=blue)
- [ ] Click `< prev` / `next >` → URL updates `?month=YYYY-MM`
- [ ] **Teacher / Admin**: "Add Event" button opens modal — title, date, type, optional course
- [ ] After creating, event appears on grid + list
- [ ] Delete event with confirm dialog

---

## 10. Lesson Packages `/packages`
- [ ] 3 cards: RoboStarter, Explorer Toolkit, ProBot Suite
- [ ] Each card: tier label, name, level badge, description, price (no `$`, separate label), Modules + Lessons stats, includes checklist, asset count badge, **"View courses →"** button
- [ ] Click "View courses" → goes to `/courses?level=ELEMENTARY` (or HS / COLLEGE)
- [ ] No "Subscribe / DEPLOY" button pretending to be checkout (intentional — package purchase isn't a real backend feature)

---

## 11. Hardware (Teacher / Admin only)

### 11.1 List `/hardware`
- [ ] Header: "Hardware kits" + summary "X kits · Y of Z units assigned"
- [ ] Kit cards: emoji, name, level, specs, total/assigned/available counts, "Assign Kit" button
- [ ] Active assignments listed below each card with Return button
- [ ] **Admin only**: "New kit" button visible

### 11.2 Assign / Return
- [ ] Open Assign modal → student dropdown filtered to those without a current kit
- [ ] Submit → assignment appears under the kit card
- [ ] Click "Return" on an assignment → it disappears, available count goes up

### 11.3 Create kit (Admin)
- [ ] Modal with name, level, total qty, emoji, specs
- [ ] Submit → kit appears in grid

---

## 12. Users (Admin only) `/users`
- [ ] Header: "Users" + "X total · Y students · Z teachers · W admins"
- [ ] Table: avatar, name, email, role, school level, course count, joined date
- [ ] Search box filters by name/email
- [ ] Role dropdown filters
- [ ] Click a row → edit modal: change role, school level, department
- [ ] Save → success toast → table updates

---

## 13. Settings `/settings`
- [ ] Profile section: name (editable), email (read-only), department
- [ ] Save name change → success toast
- [ ] Password section: current + new + confirm with eye icons
- [ ] Wrong current password → error
- [ ] Mismatched new/confirm → error
- [ ] Successful change → toast; old password no longer works on next sign-in

---

## 14. Mobile / responsive (< 768px)
- [ ] Sidebar hidden; hamburger opens it
- [ ] Topbar search collapses to icon → full-screen takeover when tapped
- [ ] Stats grid becomes 1-2 columns
- [ ] Tables become card stacks (Tasks, Grades, Users)
- [ ] Touch targets feel ≥44px
- [ ] Page titles smaller (28px), still readable
- [ ] Course cards stack 1-up
- [ ] Modals: full-width with 16px margin

---

## 15. Performance / streaming (NEW)
- [ ] After signing in, `/dashboard` should show **shell + skeletons within ~500ms**
- [ ] Each panel (stats, announcements, activity, upcoming) fills in independently as its query finishes — never a fully blank page
- [ ] Open `/courses` then a course detail — navigation feels snappy (no 4-5s pause)

---

## 16. Edge cases
- [ ] Brand-new teacher account with no courses → empty state messages, not crashes
- [ ] Course at capacity (set `maxStudents=1`, enroll one) → second enrollment shows "Course is full"
- [ ] Quiz lesson with no questions → "No quiz questions available yet"
- [ ] Empty notifications → "You're all caught up."
- [ ] Empty search results → "No matches found for "..."
- [ ] Long titles, descriptions, feedback → truncates with `...` and doesn't break layout
- [ ] Submitting a TASK with neither code nor video → form shows what's required (or accepts and saves draft)
- [ ] Student trying to access teacher-only API endpoint directly (e.g. POST `/api/courses`) → 403 Forbidden

---

## 17. Browser matrix
- [ ] Chrome (latest) — primary target
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS 16+)
- [ ] Chrome on Android

> **Known**: MetaMask and other wallet extensions inject errors into the dev overlay (`Failed to connect to MetaMask`). These are harmless — disable the extension or test in incognito if it's distracting.

---

## Bug report template

When you find something, file it like this:

```
**Page / Feature:** (e.g. /lessons/[id] — DOCX viewer)
**Role:** Student | Teacher | Admin
**Browser:** Chrome 121 / Safari 17 / etc.
**Steps to reproduce:**
1. Sign in as marcus@student.proxima.edu
2. Open the lesson "Robot Anatomy"
3. Click the attachment

**Expected:** Inline DOCX preview
**Actual:** Blank panel, console error "Failed to fetch"
**Screenshot / video:** (attach)
**Notes:** Happens 100% on Safari only; works on Chrome
```

---

## Quick health check (5 min smoke test)

If you only have 5 minutes, run this:

1. Sign in as Marcus → Dashboard renders → click into a course → click a SLIDES lesson → click a CODE lesson and submit a one-line edit → check Tasks page shows it
2. Sign out → sign in as Elena → Tasks page → grade Marcus's submission → check Marcus's Grades page reflects it
3. Use ⌘K → search for "robotics" → arrow-down → Enter → lands on the lesson
4. Click the bell → click an event notification → lands on Calendar at the right month
5. Open `/login` in incognito with `?reason=session_expired` in the URL → friendly message shows

If all five work, the deployment is healthy.
