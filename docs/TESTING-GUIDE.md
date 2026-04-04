# Proxima LMS — Testing Guide

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase or local)

### Getting Running
```bash
git clone <repo-url>
cd proxima-lms
npm install
cp .env.example .env   # Fill in DATABASE_URL, AUTH_SECRET, AUTH_URL
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
# Open http://localhost:3000
```

### Demo Accounts

All accounts use password: **`password123`**

| Role | Email | Use For |
|------|-------|---------|
| **Teacher** | elena@proxima.edu | Course management, grading, hardware, calendar |
| **Student** | marcus@student.proxima.edu | Enrolled in all 3 courses, has submissions |
| **Student** | aisha@student.proxima.edu | Enrolled in 1 course (Python) |
| **Student** | jake@student.proxima.edu | Enrolled in 1 course (Intro Robotics) |
| **Admin** | admin@proxima.edu | User management, full access to everything |

---

## Test Journeys

### Journey 1: Student Experience (Marcus)

Login as **marcus@student.proxima.edu**

#### 1.1 Dashboard
- [ ] Dashboard loads with stats: Enrolled Courses, Pending Tasks, Average Grade, Progress
- [ ] Announcements panel shows recent announcements
- [ ] Recent Activity shows Marcus's submissions
- [ ] Upcoming Events shows deadlines and events

#### 1.2 Notification Bell
- [ ] Click the bell icon in the topbar
- [ ] Dropdown shows announcements + upcoming events
- [ ] Dropdown closes when clicking outside
- [ ] Red dot appears when there are notifications

#### 1.3 Courses
- [ ] Navigate to Courses in sidebar
- [ ] See 3 enrolled courses as cards (Intro Robotics, Advanced Kinematics, Robot Programming)
- [ ] Each card shows: title, level badge, description, progress bar, module/lesson count
- [ ] Click a course card to view detail

#### 1.4 Course Detail
- [ ] Course detail page loads with header info, badges, instructor name
- [ ] Progress bar shows enrollment progress
- [ ] Course Timeline shows start/end dates and module dots
- [ ] Module Accordion expands/collapses
- [ ] Lessons inside modules are clickable

#### 1.5 Lesson Viewer — All 5 Types
Test each lesson type by navigating through "Introduction to Robotics" course:

**SLIDES** (Parts of a Robot):
- [ ] Slides render with markdown formatting
- [ ] Previous/Next navigation works
- [ ] Slide counter shows current/total

**CODE** (Your First Drive Program):
- [ ] Monaco code editor loads with skeleton code
- [ ] Brief and hints display
- [ ] Can edit code and submit
- [ ] Previously submitted code loads if exists

**QUIZ** (Identify Components Quiz):
- [ ] Questions display with radio button options
- [ ] Can select answers
- [ ] Submit shows correct/incorrect per question
- [ ] Can't change answers after submission

**TASK** (Line Following Challenge):
- [ ] Brief, requirements checklist, and rubric table display
- [ ] Can enter code in textarea
- [ ] Can enter video URL
- [ ] Submit button works
- [ ] Shows "Previously submitted" indicator if resubmitting

**VIDEO** (if any video lessons exist):
- [ ] Video player renders with controls

#### 1.6 Tasks
- [ ] Tasks page loads with tab filters: All / Pending / Graded
- [ ] Switching tabs filters correctly
- [ ] Table shows lesson title, type badge, status badge, date, grade
- [ ] Click a task to view detail
- [ ] Pagination appears if >10 items (may need more submissions to test)
- [ ] **Mobile**: Table transforms to card layout below 768px

#### 1.7 Task Detail
- [ ] Breadcrumb shows "Tasks > Lesson Title"
- [ ] Submission content displays (code/video/quiz answers)
- [ ] Grade and feedback show if graded
- [ ] Grade circle color matches score range

#### 1.8 Grades
- [ ] Summary cards show per-course stats (avg grade, completed tasks)
- [ ] Grade table lists all graded submissions
- [ ] Distribution chart shows A/B/C/F breakdown
- [ ] **Mobile**: Table becomes card stack

#### 1.9 Calendar
- [ ] Month grid renders with event dots
- [ ] Navigate between months
- [ ] Event list shows events for current month
- [ ] Event type badges color-coded (deadline=yellow, exam=red, event=blue)

#### 1.10 Packages
- [ ] 3 package cards display (RoboStarter, Explorer, ProBot)
- [ ] Each shows: name, level, price, course count, lesson count, includes checklist
- [ ] "Browse Courses" button navigates to courses page

#### 1.11 Settings
- [ ] Breadcrumb shows "Dashboard > Settings"
- [ ] Profile section: name (editable), email (read-only), department
- [ ] Can update name and department, shows success toast
- [ ] Password section: current password, new password, confirm
- [ ] Password fields have show/hide toggle (eye icon)
- [ ] Changing password with correct current password works
- [ ] Wrong current password shows error
- [ ] Mismatched new/confirm shows error
- [ ] Unsaved changes warning appears when navigating away with edits

#### 1.12 Enrollment
- [ ] Navigate to a course Marcus is NOT enrolled in (may need to create one as teacher)
- [ ] "Enroll in Course" button appears
- [ ] Clicking it enrolls and refreshes the page
- [ ] Progress bar now shows 0%
- [ ] Button disappears after enrollment

---

### Journey 2: Teacher Experience (Elena)

Login as **elena@proxima.edu**

#### 2.1 Dashboard
- [ ] Stats show: Active Courses, Pending Reviews, Total Students, Completion Rate
- [ ] Values are non-zero (3 courses, enrolled students exist)

#### 2.2 Create Course
- [ ] Navigate to Courses, click "New Course"
- [ ] Fill in: title, description, level, max students, start/end dates
- [ ] Submit creates course, redirects to courses list
- [ ] Validation errors show for missing/invalid fields

#### 2.3 Course Detail — Publish Toggle
- [ ] Open a course detail page
- [ ] "Publish" / "Unpublish" button visible
- [ ] Clicking toggles the published status
- [ ] Status badge updates (PUBLISHED / DRAFT)

#### 2.4 Course Edit — Module Management
- [ ] Click "Edit" on a course
- [ ] Breadcrumb shows "Courses > Course Title > Edit"
- [ ] Existing modules and lessons listed
- [ ] **Add Module**: Enter title, submit — module appears
- [ ] **Reorder Modules**: Up/down arrows swap module positions
- [ ] **Delete Module**: Trash icon shows confirmation dialog, deleting removes module + lessons

#### 2.5 Course Edit — Lesson Management
- [ ] **Add Lesson**: Select type (SLIDES/CODE/QUIZ/TASK/VIDEO), enter title, submit
- [ ] New lesson appears with warning icon (no content yet)
- [ ] **Reorder Lessons**: Up/down arrows work within module
- [ ] **Delete Lesson**: Trash icon shows confirmation dialog

#### 2.6 Lesson Content Editing
Click each lesson to open the edit modal:

**SLIDES editor**:
- [ ] Add/remove slides
- [ ] Edit slide title and markdown body
- [ ] Save persists content
- [ ] Warning icon disappears after saving content

**CODE editor**:
- [ ] Edit brief/instructions
- [ ] Edit code skeleton (dark theme textarea)
- [ ] Add/remove hints
- [ ] Save persists all fields

**QUIZ editor**:
- [ ] Add/remove questions
- [ ] Edit question text
- [ ] Edit 4 options per question
- [ ] Select correct answer via radio button
- [ ] Save persists quiz data

**TASK editor**:
- [ ] Edit task brief
- [ ] Add/remove requirements
- [ ] Add/remove rubric criteria (category + description)
- [ ] Save persists task content

**VIDEO editor**:
- [ ] Enter video URL
- [ ] Save persists URL

#### 2.7 Tasks — Teacher View
- [ ] Tasks page shows ALL student submissions for Elena's courses
- [ ] "Student" column visible
- [ ] Can filter by All/Pending/Graded tabs

#### 2.8 Grading
- [ ] Click a SUBMITTED task
- [ ] Grading form appears with grade input (0-100) and feedback textarea
- [ ] Submit grade — success toast
- [ ] Submission status changes to GRADED
- [ ] Student's grades page updates (revalidated)
- [ ] Student's enrollment progress recalculates

#### 2.9 Calendar — Event Management
- [ ] "Add Event" button visible
- [ ] Create event with title, date, type, optional course
- [ ] Event appears on calendar grid and event list
- [ ] Delete event: trash icon, confirmation dialog, event removed

#### 2.10 Hardware
- [ ] Hardware page shows kit cards
- [ ] Each kit shows: emoji, name, specs, level, total/assigned/available counts
- [ ] "Assign Kit" button works — opens student selection
- [ ] Assigned students shown below kit card with "Return" button
- [ ] Clicking "Return" marks kit as returned

---

### Journey 3: Admin Experience

Login as **admin@proxima.edu**

#### 3.1 Dashboard
- [ ] Stats show: Total Courses, Active Users, Hardware Kits, Packages

#### 3.2 Users Management
- [ ] Navigate to Users in sidebar (only visible for Admin)
- [ ] User table shows all 5 users with: avatar, name, email, role, level, courses, joined
- [ ] **Mobile**: Table becomes card stack
- [ ] Click a user row — edit modal opens
- [ ] Can change role (Student/Teacher/Admin)
- [ ] Can change department and school level
- [ ] Save shows success toast, table updates

#### 3.3 Hardware Kit Creation
- [ ] "New Kit" button visible (Admin only)
- [ ] Modal: name, emoji, level, quantity, specifications
- [ ] Create kit — appears in grid
- [ ] Can assign/return kits same as teacher

#### 3.4 Full Access
- [ ] Can edit ANY course (not just own)
- [ ] Can grade ANY submission
- [ ] Can create/delete calendar events
- [ ] Can access all pages

---

### Journey 4: Auth & Security

#### 4.1 Registration
- [ ] Navigate to /register
- [ ] Fill in name, email, password (6+ chars), confirm password
- [ ] Select role: Student or Teacher
- [ ] If Student: school level dropdown appears
- [ ] Submit — auto signs in, redirects to dashboard
- [ ] Duplicate email shows error

#### 4.2 Login
- [ ] Navigate to /login
- [ ] Wrong credentials show "Invalid email or password"
- [ ] Correct credentials redirect to /dashboard
- [ ] Password field has show/hide toggle

#### 4.3 Route Protection
- [ ] Visiting /dashboard while logged out redirects to /login
- [ ] Visiting /login while logged in redirects to /dashboard
- [ ] Students visiting /users redirects to /dashboard
- [ ] Students visiting /hardware redirects to /dashboard

---

### Journey 5: Responsive / Mobile

Test at mobile width (< 768px) or using browser dev tools:

#### 5.1 Navigation
- [ ] Sidebar hidden, hamburger menu visible
- [ ] Tapping hamburger opens sidebar overlay
- [ ] Tapping a nav item closes sidebar
- [ ] Close button (X) dismisses sidebar

#### 5.2 Mobile Search
- [ ] Search icon visible in topbar (replaces desktop search bar)
- [ ] Tapping expands full-width search input
- [ ] Back arrow or Escape closes search
- [ ] Input auto-focuses on open

#### 5.3 Tables → Card Stacks
- [ ] Tasks table: becomes clickable cards with title, badges, grade
- [ ] Grades table: becomes cards with lesson, course, grade circle, feedback preview
- [ ] Users table (admin): becomes cards with avatar, name, email, badges

#### 5.4 Touch Targets
- [ ] Buttons feel comfortable to tap (44px min height)
- [ ] Input fields are taller on mobile (44px)
- [ ] Icon buttons in topbar are easy to tap

#### 5.5 Typography & Layout
- [ ] Page titles are smaller on mobile (20px vs 24px desktop)
- [ ] Stat card values scale down (24px vs 32px)
- [ ] Page headers stack vertically on small screens
- [ ] Course detail metadata wraps properly
- [ ] Content has max-width on ultra-wide screens

#### 5.6 Loading States
- [ ] Navigate between pages — skeleton loading screens appear briefly
- [ ] Skeletons match the actual page layout shape

---

## Common Edge Cases to Test

- [ ] Empty states: Create a new teacher account, verify empty course/task lists show messages
- [ ] Course at capacity: Set maxStudents to 1, enroll one student, verify second gets "Course is full"
- [ ] Quiz with no questions: Create a QUIZ lesson, view it without adding questions — should show "No quiz questions available yet"
- [ ] Notification dropdown with no items: Should show "No new notifications"
- [ ] Long text: Course titles, lesson names, feedback — verify truncation and layout doesn't break

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Android
