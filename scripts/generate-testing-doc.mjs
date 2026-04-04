import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, CheckBox,
} from "docx";
import { writeFileSync } from "fs";

const COLORS = {
  teal: "22D3B7",
  dark: "0C1119",
  white: "FFFFFF",
  gray: "94A0B8",
  lightGray: "E4E8F1",
  tableBorder: "2A3650",
  tableHeader: "121926",
  tableRow: "0C1119",
};

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 280, after: 120 },
    children: [new TextRun({ text, bold: true, color: COLORS.teal, font: "Segoe UI", size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24 })],
  });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, font: "Segoe UI", size: 20, color: "333333" })],
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, font: "Segoe UI", size: 20, color: "111111" });
}

function regular(text) {
  return new TextRun({ text, font: "Segoe UI", size: 20, color: "333333" });
}

function mono(text) {
  return new TextRun({ text, font: "Consolas", size: 18, color: COLORS.teal });
}

function checkbox(text) {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level: 0 },
    children: [new TextRun({ text: "[ ] ", font: "Consolas", size: 18, color: COLORS.gray }), regular(text)],
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { type: ShadingType.SOLID, color: "F5F5F5" },
    indent: { left: 200 },
    children: [new TextRun({ text, font: "Consolas", size: 17, color: "2D2D2D" })],
  });
}

function tableCell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.header ? { type: ShadingType.SOLID, color: COLORS.teal } : opts.alt ? { type: ShadingType.SOLID, color: "F8F9FA" } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
    },
    children: [new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, bold: !!opts.header, font: "Segoe UI", size: 19, color: opts.header ? COLORS.white : "333333" })],
    })],
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Segoe UI", size: 20 } },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } },
    },
    children: [
      // Title Page
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PROXIMA LMS", bold: true, font: "Segoe UI", size: 56, color: COLORS.teal })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Quality Assurance Testing Guide", font: "Segoe UI", size: 28, color: COLORS.gray })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Robotics & Technical Education Learning Management System", font: "Segoe UI", size: 20, color: COLORS.gray })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Document Version: 1.0  |  Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, font: "Segoe UI", size: 18, color: COLORS.gray })],
      }),

      // Setup
      new Paragraph({ spacing: { before: 600 } }),
      heading("1. Setup"),
      heading("Prerequisites", HeadingLevel.HEADING_3),
      body("Node.js 18+, PostgreSQL database (Supabase or local)"),
      heading("Getting Running", HeadingLevel.HEADING_3),
      codeBlock("git clone <repo-url>"),
      codeBlock("cd proxima-lms"),
      codeBlock("npm install"),
      codeBlock("cp .env.example .env   # Fill in DATABASE_URL, AUTH_SECRET, AUTH_URL"),
      codeBlock("npx prisma migrate dev --name init"),
      codeBlock("npx prisma db seed"),
      codeBlock("npm run dev"),
      body("Open http://localhost:3000"),

      // Demo Accounts
      heading("2. Demo Accounts"),
      body("All accounts use password: password123"),
      new Paragraph({ spacing: { before: 100 } }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [tableCell("Role", { header: true }), tableCell("Email", { header: true }), tableCell("Use For", { header: true })] }),
          new TableRow({ children: [tableCell("Teacher"), tableCell("elena@proxima.edu"), tableCell("Course management, grading, hardware, calendar")] }),
          new TableRow({ children: [tableCell("Student"), tableCell("marcus@student.proxima.edu"), tableCell("Enrolled in all 3 courses, has submissions", { alt: true })] }),
          new TableRow({ children: [tableCell("Student"), tableCell("aisha@student.proxima.edu"), tableCell("Enrolled in 1 course (Python)")] }),
          new TableRow({ children: [tableCell("Student"), tableCell("jake@student.proxima.edu"), tableCell("Enrolled in 1 course (Intro Robotics)", { alt: true })] }),
          new TableRow({ children: [tableCell("Admin"), tableCell("admin@proxima.edu"), tableCell("User management, full access to everything")] }),
        ],
      }),

      // Journey 1: Student
      heading("3. Test Journeys"),
      heading("Journey 1: Student Experience", HeadingLevel.HEADING_2),
      new Paragraph({ spacing: { after: 80 }, children: [regular("Login as "), bold("marcus@student.proxima.edu")] }),

      heading("1.1 Dashboard", HeadingLevel.HEADING_3),
      checkbox("Dashboard loads with stats: Enrolled Courses, Pending Tasks, Average Grade, Progress"),
      checkbox("Announcements panel shows recent announcements"),
      checkbox("Recent Activity shows Marcus's submissions"),
      checkbox("Upcoming Events shows deadlines and events"),

      heading("1.2 Notification Bell", HeadingLevel.HEADING_3),
      checkbox("Click the bell icon — dropdown shows announcements + upcoming events"),
      checkbox("Dropdown closes when clicking outside"),
      checkbox("Red dot appears when there are notifications"),

      heading("1.3 Courses", HeadingLevel.HEADING_3),
      checkbox("Navigate to Courses — see 3 enrolled courses as cards"),
      checkbox("Each card shows: title, level badge, description, progress bar, module/lesson count"),
      checkbox("Click a course card to view detail"),

      heading("1.4 Course Detail", HeadingLevel.HEADING_3),
      checkbox("Header info, badges, instructor name display correctly"),
      checkbox("Progress bar shows enrollment progress"),
      checkbox("Course Timeline shows start/end dates and module dots"),
      checkbox("Module Accordion expands/collapses"),
      checkbox("Lessons inside modules are clickable"),

      heading("1.5 Lesson Viewer — All 5 Types", HeadingLevel.HEADING_3),
      body("Navigate through 'Introduction to Robotics' course to test each type:"),
      new Paragraph({ spacing: { after: 40 }, children: [bold("SLIDES"), regular(" (Parts of a Robot):")] }),
      checkbox("Slides render with markdown formatting"),
      checkbox("Previous/Next navigation works"),
      checkbox("Slide counter shows current/total"),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("CODE"), regular(" (Your First Drive Program):")] }),
      checkbox("Monaco code editor loads with skeleton code"),
      checkbox("Brief and hints display"),
      checkbox("Can edit code and submit"),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("QUIZ"), regular(" (Identify Components Quiz):")] }),
      checkbox("Questions display with radio button options"),
      checkbox("Submit shows correct/incorrect per question"),
      checkbox("Can't change answers after submission"),
      new Paragraph({ spacing: { before: 80, after: 40 }, children: [bold("TASK"), regular(" (Line Following Challenge):")] }),
      checkbox("Brief, requirements, and rubric display"),
      checkbox("Can enter code and video URL"),
      checkbox("Submit button works"),

      heading("1.6 Tasks", HeadingLevel.HEADING_3),
      checkbox("Tasks page loads with tab filters: All / Pending / Graded"),
      checkbox("Switching tabs filters correctly"),
      checkbox("Table shows lesson title, type badge, status, date, grade"),
      checkbox("Pagination appears if >10 items"),
      checkbox("Mobile: table transforms to card layout below 768px"),

      heading("1.7 Grades", HeadingLevel.HEADING_3),
      checkbox("Summary cards show per-course stats"),
      checkbox("Grade table lists all graded submissions"),
      checkbox("Distribution chart shows A/B/C/F breakdown"),
      checkbox("Mobile: table becomes card stack"),

      heading("1.8 Calendar, Packages, Settings", HeadingLevel.HEADING_3),
      checkbox("Calendar: month grid renders, events listed, can navigate months"),
      checkbox("Packages: 3 package cards, 'Browse Courses' button navigates to courses"),
      checkbox("Settings: can update name/department, change password with show/hide toggle"),
      checkbox("Settings: unsaved changes warning when navigating away"),

      heading("1.9 Enrollment", HeadingLevel.HEADING_3),
      checkbox("Navigate to a course not enrolled in — 'Enroll in Course' button appears"),
      checkbox("Clicking enrolls and refreshes page, progress bar shows 0%"),

      // Journey 2: Teacher
      heading("Journey 2: Teacher Experience", HeadingLevel.HEADING_2),
      new Paragraph({ spacing: { after: 80 }, children: [regular("Login as "), bold("elena@proxima.edu")] }),

      heading("2.1 Dashboard", HeadingLevel.HEADING_3),
      checkbox("Stats show: Active Courses, Pending Reviews, Total Students, Completion Rate"),

      heading("2.2 Course Creation", HeadingLevel.HEADING_3),
      checkbox("Navigate to Courses > New Course"),
      checkbox("Fill in all fields, submit — course created"),
      checkbox("Validation errors show for missing fields"),

      heading("2.3 Publish Toggle", HeadingLevel.HEADING_3),
      checkbox("Course detail shows Publish/Unpublish button"),
      checkbox("Clicking toggles status, badge updates"),

      heading("2.4 Course Edit — Modules", HeadingLevel.HEADING_3),
      checkbox("Breadcrumb: Courses > Course Title > Edit"),
      checkbox("Add Module: enter title, submit — appears"),
      checkbox("Reorder Modules: up/down arrows work"),
      checkbox("Delete Module: trash icon, confirmation dialog, module removed"),

      heading("2.5 Course Edit — Lessons", HeadingLevel.HEADING_3),
      checkbox("Add Lesson: select type + title — appears with warning icon (no content)"),
      checkbox("Reorder Lessons: up/down arrows work within module"),
      checkbox("Delete Lesson: confirmation dialog, removed"),

      heading("2.6 Lesson Content Editing", HeadingLevel.HEADING_3),
      checkbox("SLIDES: add/remove slides, edit title + markdown body, save"),
      checkbox("CODE: edit brief, code skeleton (dark textarea), add/remove hints, save"),
      checkbox("QUIZ: add/remove questions, edit options, select correct answer radio, save"),
      checkbox("TASK: edit brief, add/remove requirements + rubric criteria, save"),
      checkbox("VIDEO: enter URL, save"),
      checkbox("Warning icon disappears after saving content"),

      heading("2.7 Grading", HeadingLevel.HEADING_3),
      checkbox("Tasks page shows all student submissions for teacher's courses"),
      checkbox("Click SUBMITTED task — grading form appears"),
      checkbox("Enter grade (0-100) + feedback, submit — success toast"),
      checkbox("Student's grades + enrollment progress update"),

      heading("2.8 Calendar & Hardware", HeadingLevel.HEADING_3),
      checkbox("Calendar: Add Event button, create event, delete with confirmation"),
      checkbox("Hardware: kit cards with specs, assign kit to student, return kit"),

      // Journey 3: Admin
      heading("Journey 3: Admin Experience", HeadingLevel.HEADING_2),
      new Paragraph({ spacing: { after: 80 }, children: [regular("Login as "), bold("admin@proxima.edu")] }),

      heading("3.1 Dashboard & Users", HeadingLevel.HEADING_3),
      checkbox("Stats: Total Courses, Active Users, Hardware Kits, Packages"),
      checkbox("Users page: table with all users, click to edit role/department/level"),
      checkbox("Mobile: users table becomes card stack"),

      heading("3.2 Hardware Kit Creation", HeadingLevel.HEADING_3),
      checkbox("'New Kit' button visible (Admin only)"),
      checkbox("Modal: name, emoji, level, quantity, specs — create kit"),

      heading("3.3 Full Access", HeadingLevel.HEADING_3),
      checkbox("Can edit ANY course, grade ANY submission"),
      checkbox("Can access all pages including Users"),

      // Journey 4: Auth & Security
      heading("Journey 4: Auth & Security", HeadingLevel.HEADING_2),

      heading("4.1 Registration", HeadingLevel.HEADING_3),
      checkbox("Register with name, email, password (6+ chars), role selection"),
      checkbox("Student role shows school level dropdown"),
      checkbox("Duplicate email shows error"),
      checkbox("Auto signs in after registration"),

      heading("4.2 Login & Route Protection", HeadingLevel.HEADING_3),
      checkbox("Wrong credentials show error message"),
      checkbox("Password field has show/hide toggle"),
      checkbox("/dashboard while logged out → redirects to /login"),
      checkbox("/login while logged in → redirects to /dashboard"),
      checkbox("Students cannot access /users or /hardware"),

      // Journey 5: Mobile
      heading("Journey 5: Responsive / Mobile", HeadingLevel.HEADING_2),
      body("Test at mobile width (<768px) using browser dev tools:"),

      heading("5.1 Navigation & Search", HeadingLevel.HEADING_3),
      checkbox("Sidebar hidden, hamburger menu opens overlay"),
      checkbox("Mobile search icon expands to full-width input"),
      checkbox("Escape or back arrow closes search"),

      heading("5.2 Tables & Cards", HeadingLevel.HEADING_3),
      checkbox("Tasks table → clickable cards with title, badges, grade"),
      checkbox("Grades table → cards with lesson, course, grade circle"),
      checkbox("Users table → cards with avatar, name, email, badges"),

      heading("5.3 Touch & Typography", HeadingLevel.HEADING_3),
      checkbox("Buttons are 44px min height on mobile"),
      checkbox("Input fields are taller on mobile"),
      checkbox("Page titles scale down (20px vs 24px)"),
      checkbox("Headers stack vertically on small screens"),

      heading("5.4 Loading States", HeadingLevel.HEADING_3),
      checkbox("Skeleton loading screens appear when navigating between pages"),
      checkbox("Skeletons match actual page layout shapes"),

      // Edge Cases
      heading("4. Edge Cases", HeadingLevel.HEADING_1),
      checkbox("Empty states: new teacher account shows empty course/task lists with messages"),
      checkbox("Course at capacity: maxStudents=1, second student gets 'Course is full'"),
      checkbox("Quiz with no questions: shows 'No quiz questions available yet'"),
      checkbox("Notification dropdown empty: shows 'No new notifications'"),
      checkbox("Long text: titles, feedback — verify truncation works"),

      // Browser Compat
      heading("5. Browser Compatibility"),
      checkbox("Chrome (latest)"),
      checkbox("Firefox (latest)"),
      checkbox("Safari (latest)"),
      checkbox("Mobile Safari (iOS)"),
      checkbox("Chrome Android"),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("docs/Proxima-LMS-Testing-Guide.docx", buffer);
console.log("Generated: docs/Proxima-LMS-Testing-Guide.docx");
