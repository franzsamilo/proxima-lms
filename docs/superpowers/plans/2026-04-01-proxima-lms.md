# Proxima LMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Proxima LMS — a robotics-focused Learning Management System with hardware kit management, code submissions, and video demo reviews.

**Architecture:** Next.js 16 App Router with server components by default, Prisma ORM with PostgreSQL, Auth.js v5 (JWT strategy, Credentials provider). Foundation-first approach: scaffold + schema + auth + layout shell, then feature pages built on top. Dark "Observatory" design system with 3-tier depth surfaces, Syne/Outfit/JetBrains Mono typography.

**Tech Stack:** Next.js 16.2, React 19.2, TypeScript 5.x (strict), Tailwind CSS 4, Prisma 6.x, PostgreSQL, Auth.js v5, Uploadthing, Monaco Editor, Zod, Lucide React, bcryptjs, react-markdown, remark-gfm

**Spec reference:** `CLAUDE.md` in project root — the single source of truth for all details.

---

## File Structure

```
proxima-lms/
├── prisma/
│   ├── schema.prisma              # 12 models: User, Course, Module, Lesson, etc.
│   └── seed.ts                    # Full seed data (users, courses, lessons, submissions, etc.)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, metadata)
│   │   ├── page.tsx               # Public landing page
│   │   ├── globals.css            # Observatory theme (@theme tokens, base styles, animations)
│   │   ├── (auth)/
│   │   │   ├── layout.tsx         # Centered auth layout
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Sidebar + topbar shell
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/page.tsx
│   │   │   ├── lessons/
│   │   │   │   └── [lessonId]/page.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [taskId]/page.tsx
│   │   │   ├── grades/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── packages/page.tsx
│   │   │   ├── hardware/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── courses/
│   │       │   ├── route.ts
│   │       │   └── [courseId]/
│   │       │       ├── route.ts
│   │       │       ├── enroll/route.ts
│   │       │       └── modules/route.ts
│   │       ├── modules/
│   │       │   └── [moduleId]/
│   │       │       ├── route.ts
│   │       │       └── lessons/route.ts
│   │       ├── lessons/
│   │       │   └── [lessonId]/route.ts
│   │       ├── tasks/
│   │       │   ├── route.ts
│   │       │   └── [taskId]/
│   │       │       ├── route.ts
│   │       │       └── grade/route.ts
│   │       ├── packages/route.ts
│   │       ├── hardware/
│   │       │   ├── route.ts
│   │       │   └── assign/route.ts
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   └── [userId]/route.ts
│   │       ├── calendar/route.ts
│   │       ├── announcements/route.ts
│   │       └── uploadthing/
│   │           ├── core.ts
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/                    # Reusable primitives (button, card, badge, input, etc.)
│   │   ├── layout/                # Sidebar, topbar, mobile-nav
│   │   ├── dashboard/             # Stats grid, announcements, recent activity, upcoming events
│   │   ├── courses/               # Course card, list, module accordion, lesson item, forms
│   │   ├── lessons/               # Slide viewer, code editor, quiz renderer, task submission
│   │   ├── tasks/                 # Task table, detail, grading form, code viewer, video player
│   │   ├── grades/                # Summary cards, grade table, distribution chart
│   │   ├── calendar/              # Calendar grid, event list, create event form
│   │   ├── packages/              # Package card
│   │   ├── hardware/              # Kit card, assign modal
│   │   └── users/                 # User table, edit user modal
│   ├── lib/
│   │   ├── prisma.ts              # Singleton PrismaClient
│   │   ├── auth.ts                # NextAuth config (Credentials, JWT, callbacks)
│   │   ├── auth-helpers.ts        # getCurrentUser, requireAuth, requireRole
│   │   ├── validations.ts         # All Zod schemas
│   │   ├── utils.ts               # cn(), formatDate, grade helpers, level helpers
│   │   └── uploadthing.ts         # Uploadthing config
│   ├── actions/                   # Server Actions for mutations
│   ├── hooks/
│   │   ├── use-current-user.ts
│   │   └── use-toast.ts
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts         # Session/JWT type augmentation
├── .env.example
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `.env.example`

- [ ] **Step 1: Create Next.js app**

```bash
cd "C:\Users\Franz Samilo\Desktop\XTS Projects"
npx create-next-app@latest proxima-lms --typescript --tailwind --app --src-dir --turbopack
```

Accept defaults. This creates the base scaffold with `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, and the `src/app/` directory.

**Note:** Since the git repo already exists with CLAUDE.md, run this in a temp directory and move files in, OR run it and let it overwrite (it won't touch CLAUDE.md).

- [ ] **Step 2: Install dependencies**

```bash
cd "C:\Users\Franz Samilo\Desktop\XTS Projects\proxima-lms"

# Core
npm install prisma @prisma/client next-auth@5 @auth/prisma-adapter bcryptjs zod lucide-react clsx tailwind-merge

# Editor + uploads
npm install @monaco-editor/react uploadthing @uploadthing/react

# Markdown rendering
npm install react-markdown remark-gfm

# Dev deps
npm install -D @types/bcryptjs tsx
```

- [ ] **Step 3: Configure next.config.ts**

Replace `next.config.ts` contents:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
```

- [ ] **Step 4: Configure postcss.config.mjs**

Replace contents:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 5: Create .env.example**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/proxima_lms"
AUTH_SECRET="run: npx auth secret"
AUTH_URL="http://localhost:3000"
UPLOADTHING_TOKEN=""
```

Also create a `.env` file with actual DATABASE_URL and generate AUTH_SECRET:

```bash
npx auth secret
```

- [ ] **Step 6: Verify scaffold compiles**

```bash
npm run dev
```

Visit http://localhost:3000 — should see Next.js default page. Kill the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 project with dependencies"
```

---

## Task 2: Prisma Schema & Seed Data

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and updates `.env` with a DATABASE_URL placeholder.

- [ ] **Step 2: Write the full schema**

Replace `prisma/schema.prisma` with the complete schema from CLAUDE.md (lines 304-559). This includes:
- Enums: `Role`, `SchoolLevel`, `Tier`, `LessonType`, `SubmissionStatus`, `ModuleStatus`
- Auth.js models: `Account`, `Session`, `VerificationToken`
- Application models: `User`, `Course`, `Enrollment`, `Module`, `Lesson`, `Submission`, `LessonPackage`, `HardwareKit`, `HardwareAssignment`, `Announcement`, `CalendarEvent`

Copy the complete schema exactly as specified in CLAUDE.md.

- [ ] **Step 3: Run the migration**

```bash
npx prisma migrate dev --name init
```

Expected: migration succeeds, `prisma/migrations/` directory created.

- [ ] **Step 4: Add seed config to package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 5: Write the seed file**

Create `prisma/seed.ts` with the complete seed data from CLAUDE.md (lines 941-1191). This creates:
- 5 users (teacher, 3 students, admin) with password "password123"
- 3 lesson packages (Starter, Explorer, ProBot Suite)
- 3 courses with full module/lesson structures including slide content, quiz questions, code skeletons
- 5 enrollments with progress values
- 5 submissions (mix of SUBMITTED and GRADED)
- 3 hardware kits with assignments
- 3 announcements
- 6 calendar events

Copy the complete seed file exactly as specified in CLAUDE.md.

- [ ] **Step 6: Run the seed**

```bash
npx prisma db seed
```

Expected output:
```
✅ Seed complete
Demo accounts (password: password123):
  Teacher:  elena@proxima.edu
  Student:  marcus@student.proxima.edu
  ...
```

- [ ] **Step 7: Verify with Prisma Studio**

```bash
npx prisma studio
```

Open http://localhost:5555. Verify User, Course, Module, Lesson tables have data. Close studio.

- [ ] **Step 8: Commit**

```bash
git add prisma/ package.json
git commit -m "feat: add Prisma schema with 12 models and comprehensive seed data"
```

---

## Task 3: Core Library Files

**Files:**
- Create: `src/lib/prisma.ts`, `src/lib/utils.ts`, `src/lib/validations.ts`

- [ ] **Step 1: Create Prisma singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Create utility functions**

Create `src/lib/utils.ts` with the complete utilities from CLAUDE.md (lines 862-921): `cn()`, `formatDate()`, `formatDateTime()`, `getGradeColor()`, `getGradeBgColor()`, `getGradeLabel()`, `getLevelColor()`, `getTierFromLevel()`.

- [ ] **Step 3: Create Zod validation schemas**

Create `src/lib/validations.ts` with all schemas from CLAUDE.md (lines 786-853): `loginSchema`, `registerSchema`, `createCourseSchema`, `createModuleSchema`, `createLessonSchema`, `submitTaskSchema`, `gradeTaskSchema`, `createEventSchema`, `updateUserSchema`.

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: no errors (or only errors from files not yet created).

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add core lib files (prisma singleton, utils, Zod validations)"
```

---

## Task 4: Auth.js v5 Setup

**Files:**
- Create: `src/lib/auth.ts`, `src/lib/auth-helpers.ts`, `src/types/next-auth.d.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/register/route.ts`, `src/middleware.ts`

- [ ] **Step 1: Create NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:

```ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
```

- [ ] **Step 2: Create auth configuration**

Create `src/lib/auth.ts` with the full NextAuth config from CLAUDE.md (lines 568-631): Credentials provider, PrismaAdapter, JWT strategy, custom pages, jwt/session callbacks that pass `id` and `role`.

- [ ] **Step 3: Create auth helper functions**

Create `src/lib/auth-helpers.ts` from CLAUDE.md (lines 744-765): `getCurrentUser()`, `requireAuth()`, `requireRole()`.

- [ ] **Step 4: Create NextAuth API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

- [ ] **Step 5: Create register API route**

Create `src/app/api/auth/register/route.ts` from CLAUDE.md (lines 668-701). POST handler that: validates with `registerSchema`, checks email uniqueness, hashes password, creates user, returns `{ id, email }`.

- [ ] **Step 6: Create middleware**

Create `src/middleware.ts` from CLAUDE.md (lines 706-739). Protects dashboard/courses/lessons/tasks/grades/calendar/packages/hardware/users/settings routes. Redirects unauthenticated to `/login`, authenticated on auth pages to `/dashboard`.

- [ ] **Step 7: Verify auth compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-helpers.ts src/types/ src/app/api/auth/ src/middleware.ts
git commit -m "feat: configure Auth.js v5 with Credentials provider and middleware"
```

---

## Task 5: Global Styles & Root Layout

**Files:**
- Create/Modify: `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Write globals.css with Observatory theme**

Replace `src/app/globals.css` with the complete theme from CLAUDE.md (lines 1348-1398 for `@theme` tokens, lines 1438-1453 for font families and base styles, lines 1746-1759 for animations, lines 1775-1779 for scrollbar styling). The file must include:

```css
@import "tailwindcss";

@theme {
  /* All color tokens: surface-0/1/2/3, edge/edge-strong, ink-primary/secondary/tertiary/ghost,
     signal/signal-hover/signal-muted/signal-glow, semantic colors + tints,
     radii, shadows, font families */
  --color-surface-0: #06090F;
  --color-surface-1: #0C1119;
  --color-surface-2: #121926;
  --color-surface-3: #1A2235;
  --color-edge: #1C2536;
  --color-edge-strong: #2A3650;
  --color-ink-primary: #E4E8F1;
  --color-ink-secondary: #94A0B8;
  --color-ink-tertiary: #5C6A82;
  --color-ink-ghost: #3B4560;
  --color-signal: #22D3B7;
  --color-signal-hover: #34E8CC;
  --color-signal-muted: rgba(34, 211, 183, 0.12);
  --color-signal-glow: rgba(34, 211, 183, 0.25);
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-danger: #F87171;
  --color-info: #60A5FA;
  --color-purple: #A78BFA;
  --color-success-tint: rgba(52, 211, 153, 0.12);
  --color-warning-tint: rgba(251, 191, 36, 0.12);
  --color-danger-tint: rgba(248, 113, 113, 0.12);
  --color-info-tint: rgba(96, 165, 250, 0.12);
  --color-purple-tint: rgba(167, 139, 250, 0.12);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--color-edge);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--color-edge-strong);
  --shadow-glow: 0 0 20px var(--color-signal-glow);
  --font-family-display: var(--font-display), system-ui, sans-serif;
  --font-family-body: var(--font-body), system-ui, sans-serif;
  --font-family-mono: var(--font-mono), ui-monospace, monospace;
}

body {
  font-family: var(--font-family-body);
  background-color: var(--color-surface-0);
  color: var(--color-ink-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-edge); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-edge-strong); }
```

- [ ] **Step 2: Write root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Syne, Outfit, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Proxima LMS",
  description: "Robotics Learning Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify dev server renders dark background**

```bash
npm run dev
```

Visit http://localhost:3000 — should see the deep dark `#06090F` background.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add Observatory design system theme and root layout with fonts"
```

---

## Task 6: UI Primitives

**Files:**
- Create: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`, `src/components/ui/select.tsx`, `src/components/ui/textarea.tsx`, `src/components/ui/modal.tsx`, `src/components/ui/tabs.tsx`, `src/components/ui/progress-bar.tsx`, `src/components/ui/toast.tsx`, `src/components/ui/avatar.tsx`, `src/components/ui/grade-circle.tsx`, `src/components/ui/status-badge.tsx`, `src/components/ui/skeleton.tsx`, `src/components/ui/confirmation-dialog.tsx`, `src/components/ui/data-table.tsx`

Each component follows the Observatory design system specs from CLAUDE.md. All use the design tokens from globals.css.

- [ ] **Step 1: Create Button component**

Create `src/components/ui/button.tsx`. Four variants (Primary, Secondary, Ghost, Danger) per CLAUDE.md lines 1556-1568. Two sizes (default, small). Outfit 13px weight-600, `radius-md`, 200ms transition.

```tsx
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "default" | "sm" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-[family-name:var(--font-family-body)] text-[13px] font-semibold tracking-[0.3px] rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[var(--color-signal)] text-[var(--color-surface-0)] hover:bg-[var(--color-signal-hover)] hover:shadow-[var(--shadow-glow)]":
              variant === "primary",
            "bg-[var(--color-surface-3)] text-[var(--color-ink-primary)] border border-[var(--color-edge)] hover:border-[var(--color-edge-strong)]":
              variant === "secondary",
            "bg-transparent text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink-primary)]":
              variant === "ghost",
            "bg-[var(--color-danger)] text-white hover:brightness-110":
              variant === "danger",
          },
          {
            "px-4 py-2": size === "default",
            "px-3 py-1.5 text-[12px]": size === "sm",
            "p-2": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
export type { ButtonProps }
```

- [ ] **Step 2: Create Card component**

Create `src/components/ui/card.tsx`. `surface-2` bg, `shadow-card`, `radius-lg`, p-5, hover border transition.

```tsx
import { cn } from "@/lib/utils"
import { HTMLAttributes, forwardRef } from "react"

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] transition-all duration-200",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-[family-name:var(--font-family-display)] text-[13px] font-bold tracking-[2px] uppercase text-[var(--color-ink-tertiary)] mb-4",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export { Card, CardHeader }
```

- [ ] **Step 3: Create Badge component**

Create `src/components/ui/badge.tsx`. Pill shape, JetBrains Mono 11px, semantic color mapping per CLAUDE.md lines 1573-1585.

```tsx
import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

type BadgeVariant = "success" | "info" | "warning" | "danger" | "purple" | "neutral"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-[var(--color-success-tint)] text-[var(--color-success)]",
  info: "bg-[var(--color-info-tint)] text-[var(--color-info)]",
  warning: "bg-[var(--color-warning-tint)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-tint)] text-[var(--color-danger)]",
  purple: "bg-[var(--color-purple-tint)] text-[var(--color-purple)]",
  neutral: "bg-[rgba(94,106,130,0.12)] text-[var(--color-ink-tertiary)]",
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-[family-name:var(--font-family-mono)] text-[11px] font-medium tracking-[0.5px] rounded-full px-2.5 py-0.5",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export function LevelBadge({ level }: { level: string }) {
  const variant: BadgeVariant =
    level === "ELEMENTARY" ? "success" : level === "HS" ? "info" : "purple"
  const label = level === "HS" ? "High School" : level === "ELEMENTARY" ? "Elementary" : "College"
  return <Badge variant={variant}>{label}</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PUBLISHED: { variant: "success", label: "Published" },
    DRAFT: { variant: "neutral", label: "Draft" },
    ARCHIVED: { variant: "neutral", label: "Archived" },
    SUBMITTED: { variant: "warning", label: "Submitted" },
    GRADED: { variant: "success", label: "Graded" },
    RETURNED: { variant: "info", label: "Returned" },
  }
  const { variant, label } = map[status] ?? { variant: "neutral" as BadgeVariant, label: status }
  return <Badge variant={variant}>{label}</Badge>
}
```

- [ ] **Step 4: Create Input, Select, Textarea components**

Create `src/components/ui/input.tsx`:

```tsx
import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-[var(--color-surface-3)] border border-[var(--color-edge)] rounded-[var(--radius-md)] font-[family-name:var(--font-family-body)] text-[13px] text-[var(--color-ink-primary)] placeholder:text-[var(--color-ink-ghost)] h-10 py-2.5 px-3 transition-all duration-200 focus:border-[var(--color-edge-strong)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-signal-muted)]",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
export { Input }
```

Create `src/components/ui/select.tsx`:

```tsx
import { cn } from "@/lib/utils"
import { SelectHTMLAttributes, forwardRef } from "react"

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "w-full bg-[var(--color-surface-3)] border border-[var(--color-edge)] rounded-[var(--radius-md)] font-[family-name:var(--font-family-body)] text-[13px] text-[var(--color-ink-primary)] h-10 py-2.5 px-3 cursor-pointer transition-all duration-200 focus:border-[var(--color-edge-strong)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-signal-muted)]",
        className
      )}
      {...props}
    />
  )
)
Select.displayName = "Select"
export { Select }
```

Create `src/components/ui/textarea.tsx`:

```tsx
import { cn } from "@/lib/utils"
import { TextareaHTMLAttributes, forwardRef } from "react"

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full bg-[var(--color-surface-3)] border border-[var(--color-edge)] rounded-[var(--radius-md)] font-[family-name:var(--font-family-body)] text-[13px] text-[var(--color-ink-primary)] placeholder:text-[var(--color-ink-ghost)] min-h-[80px] py-2.5 px-3 resize-y transition-all duration-200 focus:border-[var(--color-edge-strong)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-signal-muted)]",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
export { Textarea }
```

- [ ] **Step 5: Create Modal component**

Create `src/components/ui/modal.tsx`. "use client". Overlay with backdrop blur, slide-up animation, header/body/footer sections per CLAUDE.md lines 1672-1677.

```tsx
"use client"

import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-[4px] animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      />
      <div className="relative bg-[var(--color-surface-1)] border border-[var(--color-edge)] rounded-[var(--radius-lg)] max-w-[600px] w-full max-h-[85vh] overflow-y-auto animate-[slideUp_0.2s_ease] mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-edge)]">
          <h2 className="font-[family-name:var(--font-family-display)] text-[14px] font-bold tracking-[1px] text-[var(--color-ink-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-3)] rounded-[var(--radius-md)] transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--color-edge)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create remaining UI primitives**

Create `src/components/ui/tabs.tsx`:

```tsx
"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface TabsProps {
  tabs: { label: string; value: string }[]
  defaultValue?: string
  onChange?: (value: string) => void
  children: (activeTab: string) => React.ReactNode
}

export function Tabs({ tabs, defaultValue, onChange, children }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value ?? "")

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActive(tab.value); onChange?.(tab.value) }}
            className={cn(
              "px-3 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] transition-all duration-150",
              active === tab.value
                ? "bg-[var(--color-signal-muted)] text-[var(--color-signal)]"
                : "text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  )
}
```

Create `src/components/ui/progress-bar.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  thick?: boolean
  className?: string
}

export function ProgressBar({ value, thick, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-[var(--color-surface-3)] rounded-full", thick ? "h-2" : "h-1.5", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--color-signal)] to-[#0EA5A0] transition-all duration-600 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
```

Create `src/components/ui/avatar.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

export function Avatar({ name, size = 36, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-signal)] to-[var(--color-purple)] font-[family-name:var(--font-family-body)] text-white font-bold shrink-0",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  )
}
```

Create `src/components/ui/grade-circle.tsx`:

```tsx
import { cn } from "@/lib/utils"

export function GradeCircle({ grade }: { grade: number }) {
  const color =
    grade >= 90 ? { bg: "var(--color-success-tint)", border: "var(--color-success)", text: "var(--color-success)" }
    : grade >= 80 ? { bg: "var(--color-info-tint)", border: "var(--color-info)", text: "var(--color-info)" }
    : grade >= 70 ? { bg: "var(--color-warning-tint)", border: "var(--color-warning)", text: "var(--color-warning)" }
    : { bg: "var(--color-danger-tint)", border: "var(--color-danger)", text: "var(--color-danger)" }

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-[family-name:var(--font-family-mono)] text-[16px] font-bold"
      style={{
        backgroundColor: color.bg,
        border: `2px solid color-mix(in srgb, ${color.border} 30%, transparent)`,
        color: color.text,
      }}
    >
      {grade}
    </div>
  )
}
```

Create `src/components/ui/skeleton.tsx`:

```tsx
import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--color-surface-3)] rounded-[var(--radius-md)]",
        className
      )}
    />
  )
}
```

Create `src/components/ui/toast.tsx`:

```tsx
"use client"

import { Check, X } from "lucide-react"
import { useEffect } from "react"

interface ToastProps {
  message: string
  type?: "success" | "error"
  onClose: () => void
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[slideUp_0.3s_ease]">
      <div className={cn(
        "flex items-center gap-3 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] px-4 py-3 border-l-[3px]",
        type === "success" ? "border-l-[var(--color-signal)]" : "border-l-[var(--color-danger)]"
      )}>
        {type === "success" ? (
          <Check size={14} className="text-[var(--color-signal)]" />
        ) : (
          <X size={14} className="text-[var(--color-danger)]" />
        )}
        <span className="font-[family-name:var(--font-family-body)] text-[13px] font-medium text-[var(--color-ink-primary)]">
          {message}
        </span>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
```

Create `src/components/ui/confirmation-dialog.tsx`:

```tsx
"use client"

import { Modal } from "./modal"
import { Button } from "./button"

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: "danger" | "primary"
}

export function ConfirmationDialog({
  open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "danger",
}: ConfirmationDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-[var(--color-ink-secondary)] text-[14px]">{message}</p>
    </Modal>
  )
}
```

- [ ] **Step 7: Create toast hook**

Create `src/hooks/use-toast.ts`:

```ts
"use client"

import { useState, useCallback } from "react"

interface ToastState {
  message: string
  type: "success" | "error"
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  return { toast, showToast, hideToast }
}
```

- [ ] **Step 8: Verify compilation**

```bash
npx tsc --noEmit
```

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/ src/hooks/
git commit -m "feat: add UI primitive components (Observatory design system)"
```

---

## Task 7: Auth Pages (Login & Register)

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create auth layout**

Create `src/app/(auth)/layout.tsx` — centered layout, `surface-0` bg, no sidebar:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-0)] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] animate-[fadeIn_0.25s_ease]">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create login page**

Create `src/app/(auth)/login/page.tsx`. "use client". Logo block (64×64 rounded-2xl gradient, "P" in Syne), "PROXIMA" wordmark, "ROBOTICS LMS" subtitle. Card with email/password inputs, sign-in button, link to register. Demo hint at bottom. Uses `signIn("credentials", ...)` from next-auth/react. Error display from searchParams.

Full implementation per CLAUDE.md lines 1722-1729 and login spec (line 1283).

- [ ] **Step 3: Create register page**

Create `src/app/(auth)/register/page.tsx`. "use client". Same logo block. Name, email, password, confirm password. Role toggle (Student/Teacher). If Student → school level dropdown. POST to `/api/auth/register`, then auto sign-in on success.

Per CLAUDE.md register spec (line 1286).

- [ ] **Step 4: Test auth flow manually**

```bash
npm run dev
```

1. Visit http://localhost:3000/login — should see the login form
2. Enter elena@proxima.edu / password123 → should redirect to /dashboard (which 404s for now, that's OK — middleware redirect works)
3. Visit http://localhost:3000/register — should see the register form

- [ ] **Step 5: Commit**

```bash
git add src/app/(auth)/
git commit -m "feat: add login and register pages with Auth.js v5 integration"
```

---

## Task 8: Dashboard Layout (Sidebar + Topbar + Mobile Nav)

**Files:**
- Create: `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/mobile-nav.tsx`, `src/app/(dashboard)/layout.tsx`
- Create: `src/hooks/use-current-user.ts`

- [ ] **Step 1: Create use-current-user hook**

Create `src/hooks/use-current-user.ts`:

```ts
"use client"

import { useSession } from "next-auth/react"

export function useCurrentUser() {
  const { data: session, status } = useSession()
  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
```

- [ ] **Step 2: Create Sidebar component**

Create `src/components/layout/sidebar.tsx`. "use client". 256px fixed width. `surface-1` bg. Contains:
- Logo block (72px tall): 36×36 gradient rounded square with "P", "PROXIMA" wordmark, "ROBOTICS LMS" subtitle
- Nav groups (MAIN, RESOURCES, SYSTEM) with role-based items per CLAUDE.md lines 1503-1518
- Active state: `signal-muted` bg, `signal` text, 3px left bar
- Pending badge on Tasks (count from prop)
- User block at bottom with avatar, name, role
- Icons from lucide-react (LayoutDashboard, BookOpen, CheckSquare, BarChart3, CalendarDays, Package, Wrench, Users, Settings)

Full implementation per CLAUDE.md sidebar spec (lines 1493-1520).

- [ ] **Step 3: Create Topbar component**

Create `src/components/layout/topbar.tsx`. "use client". 60px height, `surface-1` bg, bottom `edge` border. Left: page title. Right: search bar, notification bell (with dot), user avatar. Mobile: hamburger button.

Per CLAUDE.md topbar spec (lines 1526-1531).

- [ ] **Step 4: Create MobileNav component**

Create `src/components/layout/mobile-nav.tsx`. "use client". Slide-in overlay sidebar for mobile. Same nav items as sidebar. Triggered by hamburger button in topbar.

- [ ] **Step 5: Create dashboard layout**

Create `src/app/(dashboard)/layout.tsx`. Server component. Fetches current user with `getCurrentUser()`. Wraps children with SessionProvider, Sidebar, Topbar, and main content area.

```tsx
import { getCurrentUser } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <DashboardShell user={JSON.parse(JSON.stringify(user))}>{children}</DashboardShell>
}
```

Create `src/app/(dashboard)/dashboard-shell.tsx` as a "use client" wrapper that provides SessionProvider and renders the sidebar + topbar + main layout:

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { useState } from "react"

interface DashboardShellProps {
  user: { id: string; name: string; email: string; role: string; image?: string | null }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-surface-0)]">
        <Sidebar user={user} mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar user={user} onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 animate-[fadeIn_0.25s_ease]">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
```

- [ ] **Step 6: Verify layout renders**

```bash
npm run dev
```

Login as elena@proxima.edu → should see sidebar + topbar shell (main content area will be empty/404).

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/ src/app/(dashboard)/ src/hooks/
git commit -m "feat: add dashboard layout with sidebar, topbar, and mobile nav"
```

---

## Task 9: Landing Page

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create landing page**

Replace `src/app/page.tsx` with the public landing page. Dark bg, centered hero with:
- Large Proxima logo (teal gradient rounded square, "P" inside)
- "PROXIMA" title in Syne 800, 6px letter-spacing, gradient text
- "Robotics Learning Management System" subtitle in Outfit
- Value prop paragraph
- Two CTA buttons: "Sign In" → /login, "Learn More" scrolls
- Feature cards section: "Integrated Hardware Kits", "Code & Video Submissions", "Curriculum Packages"
- Footer

Per CLAUDE.md landing page spec (line 1280).

- [ ] **Step 2: Verify landing page**

```bash
npm run dev
```

Visit http://localhost:3000 — should see the dark landing page with hero and feature cards.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add public landing page with Observatory design"
```

---

## Task 10: Dashboard Page

**Files:**
- Create: `src/app/(dashboard)/dashboard/page.tsx`, `src/components/dashboard/stats-grid.tsx`, `src/components/dashboard/announcements-panel.tsx`, `src/components/dashboard/recent-activity.tsx`, `src/components/dashboard/upcoming-events.tsx`

- [ ] **Step 1: Create StatsGrid component**

Create `src/components/dashboard/stats-grid.tsx`. Server component. Role-adaptive:
- **Student**: Enrolled Courses, Pending Tasks, Average Grade, Progress
- **Teacher**: Active Courses, Pending Reviews, Total Students, Completion Rate
- **Admin**: Total Courses, Active Users, Hardware Kits, Packages

Each stat card uses Card + stat value (Syne 32px 800) + label (JetBrains Mono 10px uppercase) + optional progress bar.

Props: `{ role: string; stats: { label: string; value: string | number; subtext?: string; progress?: number }[] }`

- [ ] **Step 2: Create AnnouncementsPanel component**

Create `src/components/dashboard/announcements-panel.tsx`. Card with "ANNOUNCEMENTS" header. List of announcements with title, content preview, priority badge (high=danger, normal=neutral), relative time. Data fetched server-side.

- [ ] **Step 3: Create RecentActivity component**

Create `src/components/dashboard/recent-activity.tsx`. Card with "RECENT ACTIVITY" header. Shows recent submissions/grades. Each item: icon + description + timestamp.

- [ ] **Step 4: Create UpcomingEvents component**

Create `src/components/dashboard/upcoming-events.tsx`. Card with "UPCOMING" header. Lists upcoming calendar events with date, title, type badge (deadline=warning, exam=danger, event=signal).

- [ ] **Step 5: Create Dashboard page**

Create `src/app/(dashboard)/dashboard/page.tsx`. Server component. Fetches user with `getCurrentUser()`. Queries Prisma for role-specific stats, announcements, recent activity, upcoming events. Renders the 4 components in a grid.

```tsx
import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Fetch role-specific data with Prisma queries...
  // Build stats array based on role...

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[24px] font-bold tracking-tight text-[var(--color-ink-primary)] mb-1">
        Dashboard
      </h1>
      <p className="text-[14px] text-[var(--color-ink-tertiary)] mb-6">
        Welcome back, {user.name.split(" ")[0]}
      </p>
      <StatsGrid role={user.role} stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2 space-y-5">
          <AnnouncementsPanel announcements={announcements} />
          <RecentActivity submissions={recentSubmissions} />
        </div>
        <UpcomingEvents events={upcomingEvents} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify dashboard renders with seed data**

```bash
npm run dev
```

Login as elena@proxima.edu → should see teacher dashboard with stats, announcements, activity, events.

- [ ] **Step 7: Commit**

```bash
git add src/app/(dashboard)/dashboard/ src/components/dashboard/
git commit -m "feat: add dashboard page with role-adaptive stats, announcements, activity, events"
```

---

## Task 11: Courses API Routes

**Files:**
- Create: `src/app/api/courses/route.ts`, `src/app/api/courses/[courseId]/route.ts`, `src/app/api/courses/[courseId]/enroll/route.ts`, `src/app/api/courses/[courseId]/modules/route.ts`

- [ ] **Step 1: Create courses list/create route**

Create `src/app/api/courses/route.ts`:
- GET: Students → enrolled courses (via Enrollment join). Teachers → their courses. Admins → all. Supports `?level=` and `?search=` query params.
- POST: Teacher/Admin only. Validates `createCourseSchema`. Auto-sets `instructorId`, `tier` from `getTierFromLevel()`, `isPublished: false`.

Per CLAUDE.md route behaviors table (lines 1211-1214).

All dynamic routes use Next.js 16 async params pattern:
```ts
export async function GET(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  // ...
}
```

- [ ] **Step 2: Create course detail route**

Create `src/app/api/courses/[courseId]/route.ts`:
- GET: Enrolled/Instructor/Admin. Course with nested modules → lessons. Include `_count` of enrollments.
- PATCH: Instructor/Admin. Partial update.
- DELETE: Instructor/Admin. Delete with cascade.

- [ ] **Step 3: Create enroll route**

Create `src/app/api/courses/[courseId]/enroll/route.ts`:
- POST: Student only. Check `maxStudents`. Prevent duplicate. Create `Enrollment` with `progress: 0`.

- [ ] **Step 4: Create modules route**

Create `src/app/api/courses/[courseId]/modules/route.ts`:
- POST: Instructor/Admin. Create module. Auto-set `order` = max+1.

- [ ] **Step 5: Verify routes with curl or browser**

```bash
npm run dev
```

Test: `curl http://localhost:3000/api/courses` (should require auth, return 401 or redirect).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/courses/
git commit -m "feat: add courses API routes (list, detail, enroll, modules)"
```

---

## Task 12: Modules & Lessons API Routes

**Files:**
- Create: `src/app/api/modules/[moduleId]/route.ts`, `src/app/api/modules/[moduleId]/lessons/route.ts`, `src/app/api/lessons/[lessonId]/route.ts`

- [ ] **Step 1: Create module routes**

Create `src/app/api/modules/[moduleId]/route.ts`:
- PATCH: Instructor/Admin. Update title, order, status.
- DELETE: Instructor/Admin. Cascade to lessons.

Create `src/app/api/modules/[moduleId]/lessons/route.ts`:
- POST: Instructor/Admin. Create lesson. Auto-set order. Validate `createLessonSchema`.

- [ ] **Step 2: Create lesson route**

Create `src/app/api/lessons/[lessonId]/route.ts`:
- GET: Enrolled/Instructor/Admin. Full lesson content. For students: include their submission if exists.
- PATCH: Instructor/Admin. Update content/metadata.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/modules/ src/app/api/lessons/
git commit -m "feat: add modules and lessons API routes"
```

---

## Task 13: Tasks & Grading API Routes

**Files:**
- Create: `src/app/api/tasks/route.ts`, `src/app/api/tasks/[taskId]/route.ts`, `src/app/api/tasks/[taskId]/grade/route.ts`

- [ ] **Step 1: Create tasks list/create route**

Create `src/app/api/tasks/route.ts`:
- GET: Students → their submissions. Teachers → submissions for their courses. Supports `?status=`, `?courseId=`. Include lesson title and student name.
- POST: Student only. Upsert on `[studentId, lessonId]`. Set `status: SUBMITTED`, `submittedAt: now()`. Validate `submitTaskSchema`.

- [ ] **Step 2: Create task detail route**

Create `src/app/api/tasks/[taskId]/route.ts`:
- GET: Owner/Instructor/Admin. Full submission detail.

- [ ] **Step 3: Create grade route**

Create `src/app/api/tasks/[taskId]/grade/route.ts`:
- PATCH: Instructor/Admin. Validate `gradeTaskSchema`. Set `status: GRADED`, `gradedAt: now()`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/tasks/
git commit -m "feat: add tasks and grading API routes"
```

---

## Task 14: Remaining API Routes (Packages, Hardware, Users, Calendar, Announcements)

**Files:**
- Create: `src/app/api/packages/route.ts`, `src/app/api/hardware/route.ts`, `src/app/api/hardware/assign/route.ts`, `src/app/api/users/route.ts`, `src/app/api/users/[userId]/route.ts`, `src/app/api/calendar/route.ts`, `src/app/api/announcements/route.ts`

- [ ] **Step 1: Create packages route**

Create `src/app/api/packages/route.ts`:
- GET: Any authenticated user. List active packages.

- [ ] **Step 2: Create hardware routes**

Create `src/app/api/hardware/route.ts`:
- GET: Teacher/Admin. Kits with active assignment count (`returnedAt` is null).

Create `src/app/api/hardware/assign/route.ts`:
- POST: Teacher/Admin. `{ kitId, userId }`. Check availability. Create assignment.

- [ ] **Step 3: Create users routes**

Create `src/app/api/users/route.ts`:
- GET: Admin only. All users. Supports `?role=`, `?search=`. Include `_count` enrollments.

Create `src/app/api/users/[userId]/route.ts`:
- PATCH: Admin only. Update role, department, schoolLevel. Validate `updateUserSchema`.

- [ ] **Step 4: Create calendar route**

Create `src/app/api/calendar/route.ts`:
- GET: Any. Events filtered by role's enrolled courses + null courseId events. Supports `?month=YYYY-MM`.
- POST: Teacher/Admin. Validate `createEventSchema`.

- [ ] **Step 5: Create announcements route**

Create `src/app/api/announcements/route.ts`:
- GET: Any. All, ordered by `createdAt` desc.
- POST: Teacher/Admin. `{ title, content, priority }`.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/packages/ src/app/api/hardware/ src/app/api/users/ src/app/api/calendar/ src/app/api/announcements/
git commit -m "feat: add packages, hardware, users, calendar, and announcements API routes"
```

---

## Task 15: Server Actions

**Files:**
- Create: `src/actions/course-actions.ts`, `src/actions/module-actions.ts`, `src/actions/lesson-actions.ts`, `src/actions/task-actions.ts`, `src/actions/grading-actions.ts`, `src/actions/calendar-actions.ts`, `src/actions/hardware-actions.ts`, `src/actions/user-actions.ts`, `src/actions/announcement-actions.ts`

- [ ] **Step 1: Create course actions**

Create `src/actions/course-actions.ts`. "use server". Functions: `createCourse(formData)`, `updateCourse(courseId, formData)`, `deleteCourse(courseId)`, `publishCourse(courseId)`. Each: validates with Zod, checks role with `requireRole()`, performs Prisma mutation, calls `revalidatePath()`.

Pattern per CLAUDE.md lines 1248-1272.

- [ ] **Step 2: Create module & lesson actions**

Create `src/actions/module-actions.ts`: `createModule(formData)`, `updateModule(moduleId, formData)`, `deleteModule(moduleId)`.

Create `src/actions/lesson-actions.ts`: `createLesson(formData)`, `updateLesson(lessonId, formData)`, `deleteLesson(lessonId)`.

- [ ] **Step 3: Create task & grading actions**

Create `src/actions/task-actions.ts`: `submitTask(formData)` — upsert on [studentId, lessonId].

Create `src/actions/grading-actions.ts`: `gradeSubmission(submissionId, formData)`.

- [ ] **Step 4: Create remaining actions**

Create `src/actions/calendar-actions.ts`: `createEvent(formData)`, `deleteEvent(eventId)`.

Create `src/actions/hardware-actions.ts`: `assignKit(formData)`, `returnKit(assignmentId)`.

Create `src/actions/user-actions.ts`: `updateUser(userId, formData)`.

Create `src/actions/announcement-actions.ts`: `createAnnouncement(formData)`.

- [ ] **Step 5: Commit**

```bash
git add src/actions/
git commit -m "feat: add server actions for all mutations"
```

---

## Task 16: Courses Pages & Components

**Files:**
- Create: `src/app/(dashboard)/courses/page.tsx`, `src/app/(dashboard)/courses/new/page.tsx`, `src/app/(dashboard)/courses/[courseId]/page.tsx`, `src/app/(dashboard)/courses/[courseId]/edit/page.tsx`
- Create: `src/components/courses/course-card.tsx`, `src/components/courses/course-list.tsx`, `src/components/courses/module-accordion.tsx`, `src/components/courses/lesson-item.tsx`, `src/components/courses/course-timeline.tsx`, `src/components/courses/create-course-form.tsx`

- [ ] **Step 1: Create CourseCard component**

Create `src/components/courses/course-card.tsx`. Card with: title, level/tier badges, description (truncated), module/lesson count, progress bar, instructor name, enrollment count. Links to `/courses/[courseId]`.

- [ ] **Step 2: Create CourseList component**

Create `src/components/courses/course-list.tsx`. Grid of CourseCards. 3-col on lg, 2-col md, 1-col sm.

- [ ] **Step 3: Create courses list page**

Create `src/app/(dashboard)/courses/page.tsx`. Server component. Fetches courses for current user (role-aware). Teachers see "New Course" button. Renders CourseList.

- [ ] **Step 4: Create CreateCourseForm**

Create `src/components/courses/create-course-form.tsx`. "use client". Form fields: title, description, level (select), max students, start/end dates. Calls `createCourse` server action.

- [ ] **Step 5: Create new course page**

Create `src/app/(dashboard)/courses/new/page.tsx`. Renders CreateCourseForm inside a Card.

- [ ] **Step 6: Create ModuleAccordion and LessonItem**

Create `src/components/courses/module-accordion.tsx`. "use client". Expandable module block per CLAUDE.md module accordion spec (lines 1644-1647). Module header with number, title, lesson count, chevron. Expanded: list of LessonItems.

Create `src/components/courses/lesson-item.tsx`. 48px tall, icon box (color-coded by status), title, type badge, duration. Links to `/lessons/[lessonId]`.

- [ ] **Step 7: Create course detail page**

Create `src/app/(dashboard)/courses/[courseId]/page.tsx`. Async params. Server component. Fetches course with modules → lessons. Header with title, badges, progress bar, enrollment info. Module accordion. Teachers: edit/add buttons.

```tsx
export default async function CourseDetailPage(
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  // Fetch course, render...
}
```

- [ ] **Step 8: Create course edit page**

Create `src/app/(dashboard)/courses/[courseId]/edit/page.tsx`. Async params. Pre-filled form for editing course details + managing modules/lessons.

- [ ] **Step 9: Verify courses flow**

Login as teacher → Courses → should see 3 seed courses. Click one → should see modules/lessons.

- [ ] **Step 10: Commit**

```bash
git add src/app/(dashboard)/courses/ src/components/courses/
git commit -m "feat: add courses pages with list, detail, create, edit, module accordion"
```

---

## Task 17: Lesson Viewer Page & Components

**Files:**
- Create: `src/app/(dashboard)/lessons/[lessonId]/page.tsx`
- Create: `src/components/lessons/slide-viewer.tsx`, `src/components/lessons/code-editor.tsx`, `src/components/lessons/quiz-renderer.tsx`, `src/components/lessons/task-submission.tsx`

- [ ] **Step 1: Create SlideViewer**

Create `src/components/lessons/slide-viewer.tsx`. "use client". Renders markdown slides using `react-markdown` with `remark-gfm`. Navigation buttons (prev/next). Slide counter. Each slide: title + body rendered as markdown.

- [ ] **Step 2: Create CodeEditor**

Create `src/components/lessons/code-editor.tsx`. "use client". Monaco editor with `vs-dark` theme, bg override `#0D1117`. Loads code skeleton as initial value. Submit button calls `submitTask` server action.

- [ ] **Step 3: Create QuizRenderer**

Create `src/components/lessons/quiz-renderer.tsx`. "use client". Renders questions with radio button options. Submit button. Shows results after submission (correct/incorrect per question).

- [ ] **Step 4: Create TaskSubmission**

Create `src/components/lessons/task-submission.tsx`. "use client". Shows task brief, requirements, rubric. Code textarea + video upload (Uploadthing). Submit button.

- [ ] **Step 5: Create lesson viewer page**

Create `src/app/(dashboard)/lessons/[lessonId]/page.tsx`. Async params. Fetches lesson + student's submission. Switches on `lesson.type`:
- SLIDES → SlideViewer
- CODE → CodeEditor
- QUIZ → QuizRenderer
- TASK → TaskSubmission

- [ ] **Step 6: Verify lesson viewer**

Navigate to a course → click a lesson → should render appropriate viewer.

- [ ] **Step 7: Commit**

```bash
git add src/app/(dashboard)/lessons/ src/components/lessons/
git commit -m "feat: add lesson viewer with slides, code editor, quiz, and task submission"
```

---

## Task 18: Tasks & Grading Pages

**Files:**
- Create: `src/app/(dashboard)/tasks/page.tsx`, `src/app/(dashboard)/tasks/[taskId]/page.tsx`
- Create: `src/components/tasks/task-table.tsx`, `src/components/tasks/task-detail.tsx`, `src/components/tasks/grading-form.tsx`, `src/components/tasks/code-viewer.tsx`, `src/components/tasks/video-player.tsx`

- [ ] **Step 1: Create CodeViewer component**

Create `src/components/tasks/code-viewer.tsx`. Static code display with GitHub-dark styling per CLAUDE.md (lines 1654-1665). JetBrains Mono 13px, `#0D1117` bg, `#C9D1D9` text.

- [ ] **Step 2: Create VideoPlayer component**

Create `src/components/tasks/video-player.tsx`. "use client". HTML5 video player with controls. Styled container.

- [ ] **Step 3: Create TaskTable component**

Create `src/components/tasks/task-table.tsx`. Table per CLAUDE.md table spec (lines 1623-1628). Columns: Task, Student (teacher view), Type, Status badge, Submitted date, Grade circle. Row links to `/tasks/[taskId]`.

- [ ] **Step 4: Create GradingForm component**

Create `src/components/tasks/grading-form.tsx`. "use client". Grade input (0-100) + feedback textarea. Calls `gradeSubmission` server action.

- [ ] **Step 5: Create tasks list page**

Create `src/app/(dashboard)/tasks/page.tsx`. Server component. Tabs: All / Pending / Graded. Fetches submissions. Renders TaskTable.

- [ ] **Step 6: Create task detail page**

Create `src/app/(dashboard)/tasks/[taskId]/page.tsx`. Async params. Shows CodeViewer, VideoPlayer, or quiz answers depending on submission type. Grade + feedback if graded. GradingForm if teacher + ungraded.

- [ ] **Step 7: Verify tasks flow**

Login as teacher → Tasks → should see submissions. Click one → should see detail + grading form.

- [ ] **Step 8: Commit**

```bash
git add src/app/(dashboard)/tasks/ src/components/tasks/
git commit -m "feat: add tasks pages with table, detail, code viewer, video player, grading form"
```

---

## Task 19: Grades Page

**Files:**
- Create: `src/app/(dashboard)/grades/page.tsx`
- Create: `src/components/grades/grade-summary-cards.tsx`, `src/components/grades/grade-table.tsx`, `src/components/grades/grade-distribution-chart.tsx`

- [ ] **Step 1: Create GradeSummaryCards**

Create `src/components/grades/grade-summary-cards.tsx`. Per-course summary cards with course title, average grade (GradeCircle), completed/total tasks, progress bar.

- [ ] **Step 2: Create GradeTable**

Create `src/components/grades/grade-table.tsx`. Full grade table. Columns: Task, Course, Type, Submitted, Grade, Feedback (truncated).

- [ ] **Step 3: Create GradeDistributionChart**

Create `src/components/grades/grade-distribution-chart.tsx`. "use client". Simple bar chart showing grade distribution (A/B/C/F counts) using CSS bars (no chart library needed).

- [ ] **Step 4: Create grades page**

Create `src/app/(dashboard)/grades/page.tsx`. Server component. Fetches graded submissions for current user. Renders summary cards + table + distribution chart.

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/grades/ src/components/grades/
git commit -m "feat: add grades page with summary cards, table, and distribution chart"
```

---

## Task 20: Calendar Page

**Files:**
- Create: `src/app/(dashboard)/calendar/page.tsx`
- Create: `src/components/calendar/calendar-grid.tsx`, `src/components/calendar/event-list.tsx`, `src/components/calendar/create-event-form.tsx`

- [ ] **Step 1: Create CalendarGrid**

Create `src/components/calendar/calendar-grid.tsx`. "use client". 7-column CSS grid per CLAUDE.md calendar spec (lines 1690-1694). Day headers (Mon-Sun). Day cells with event dots. Today highlighted. Month navigation.

- [ ] **Step 2: Create EventList**

Create `src/components/calendar/event-list.tsx`. List of events for the selected month. Each: date, title, type badge.

- [ ] **Step 3: Create CreateEventForm**

Create `src/components/calendar/create-event-form.tsx`. "use client". Modal form: title, date, type (deadline/exam/event), optional courseId. Calls `createEvent` server action.

- [ ] **Step 4: Create calendar page**

Create `src/app/(dashboard)/calendar/page.tsx`. Server component. Fetches events for current month. Renders CalendarGrid + EventList. Teachers: "Add Event" button opens CreateEventForm modal.

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/calendar/ src/components/calendar/
git commit -m "feat: add calendar page with month grid, event list, and event creation"
```

---

## Task 21: Packages Page

**Files:**
- Create: `src/app/(dashboard)/packages/page.tsx`, `src/components/packages/package-card.tsx`

- [ ] **Step 1: Create PackageCard**

Create `src/components/packages/package-card.tsx`. Per CLAUDE.md package card spec (lines 1700-1708). Card with 3px colored top border (by tier), price in Syne 22px, stats boxes (Modules/Lessons), includes checklist, Subscribe button.

- [ ] **Step 2: Create packages page**

Create `src/app/(dashboard)/packages/page.tsx`. Server component. Fetches active packages with course counts. Renders 3 PackageCards.

- [ ] **Step 3: Commit**

```bash
git add src/app/(dashboard)/packages/ src/components/packages/
git commit -m "feat: add lesson packages page with tier cards"
```

---

## Task 22: Hardware Page

**Files:**
- Create: `src/app/(dashboard)/hardware/page.tsx`, `src/components/hardware/kit-card.tsx`, `src/components/hardware/assign-kit-modal.tsx`

- [ ] **Step 1: Create KitCard**

Create `src/components/hardware/kit-card.tsx`. Per CLAUDE.md kit card spec (lines 1713-1717). Large emoji, name, level badge, spec string, 3 stat boxes (Total/Assigned/Available), assignment progress bar.

- [ ] **Step 2: Create AssignKitModal**

Create `src/components/hardware/assign-kit-modal.tsx`. "use client". Modal with student select dropdown + assign button. Calls `assignKit` server action.

- [ ] **Step 3: Create hardware page**

Create `src/app/(dashboard)/hardware/page.tsx`. Server component. Teacher/Admin only. Fetches kits with assignment counts. Renders KitCards + AssignKitModal.

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/hardware/ src/components/hardware/
git commit -m "feat: add hardware kits page with assignment management"
```

---

## Task 23: Admin Users Page

**Files:**
- Create: `src/app/(dashboard)/users/page.tsx`, `src/components/users/user-table.tsx`, `src/components/users/edit-user-modal.tsx`

- [ ] **Step 1: Create UserTable**

Create `src/components/users/user-table.tsx`. Table with columns: Name, Email, Role badge, Level, Courses count, Joined date. Per CLAUDE.md table styling spec.

- [ ] **Step 2: Create EditUserModal**

Create `src/components/users/edit-user-modal.tsx`. "use client". Modal to edit user role, department, school level. Calls `updateUser` server action.

- [ ] **Step 3: Create users page**

Create `src/app/(dashboard)/users/page.tsx`. Server component. Admin only. Fetches all users with enrollment counts. Renders UserTable + EditUserModal.

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/users/ src/components/users/
git commit -m "feat: add admin users page with role management"
```

---

## Task 24: Settings Page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Create `src/app/(dashboard)/settings/page.tsx`. "use client" for form interactions. Profile form (name, email, department). Password change form (current, new, confirm). Uses server actions for updates. Shows success/error toasts.

- [ ] **Step 2: Commit**

```bash
git add src/app/(dashboard)/settings/
git commit -m "feat: add settings page with profile and password management"
```

---

## Task 25: Uploadthing Configuration

**Files:**
- Create: `src/lib/uploadthing.ts`, `src/app/api/uploadthing/core.ts`, `src/app/api/uploadthing/route.ts`

- [ ] **Step 1: Create Uploadthing file router**

Create `src/app/api/uploadthing/core.ts`:

```ts
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"

const f = createUploadthing()

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "64MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),
  fileUploader: f({ blob: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

- [ ] **Step 2: Create Uploadthing route**

Create `src/app/api/uploadthing/route.ts`:

```ts
import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"

export const { GET, POST } = createRouteHandler({ router: ourFileRouter })
```

- [ ] **Step 3: Create Uploadthing client helper**

Create `src/lib/uploadthing.ts`:

```ts
import { generateReactHelpers } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>()
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/uploadthing/ src/lib/uploadthing.ts
git commit -m "feat: configure Uploadthing for video and file uploads"
```

---

## Task 26: Types Index

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create shared types**

Create `src/types/index.ts` with any shared type definitions used across components (e.g., serialized user type for client components, course with modules type, etc.):

```ts
import type { Role, SchoolLevel, Tier, LessonType, SubmissionStatus, ModuleStatus } from "@prisma/client"

export type SerializedUser = {
  id: string
  name: string
  email: string
  role: Role
  image: string | null
  department: string | null
  schoolLevel: SchoolLevel | null
}

export type CourseWithModules = {
  id: string
  title: string
  description: string
  level: SchoolLevel
  tier: Tier
  maxStudents: number
  startDate: string
  endDate: string
  isPublished: boolean
  instructorId: string
  instructor: { name: string }
  modules: ModuleWithLessons[]
  _count: { enrollments: number }
}

export type ModuleWithLessons = {
  id: string
  title: string
  order: number
  status: ModuleStatus
  lessons: LessonSummary[]
}

export type LessonSummary = {
  id: string
  title: string
  type: LessonType
  order: number
  durationMins: number
}

export type SubmissionWithDetails = {
  id: string
  status: SubmissionStatus
  submittedAt: string | null
  gradedAt: string | null
  grade: number | null
  feedback: string | null
  codeContent: string | null
  videoUrl: string | null
  quizAnswers: Record<string, string> | null
  fileUrl: string | null
  student: { id: string; name: string }
  lesson: { id: string; title: string; type: LessonType }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/
git commit -m "feat: add shared TypeScript type definitions"
```

---

## Task 27: Polish — Loading States, Error Boundaries, Responsive

**Files:**
- Create: `src/app/(dashboard)/loading.tsx`, `src/app/(dashboard)/error.tsx`, various page-level `loading.tsx` files
- Create: `src/components/ui/data-table.tsx` (responsive table wrapper)

- [ ] **Step 1: Create dashboard loading skeleton**

Create `src/app/(dashboard)/loading.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create error boundary**

Create `src/app/(dashboard)/error.tsx`:

```tsx
"use client"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="font-[family-name:var(--font-family-display)] text-[20px] font-bold text-[var(--color-ink-primary)]">
        Something went wrong
      </h2>
      <p className="text-[14px] text-[var(--color-ink-tertiary)]">{error.message}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
```

- [ ] **Step 3: Create responsive DataTable wrapper**

Create `src/components/ui/data-table.tsx`. Wraps tables to make them responsive. On mobile (<768px), transforms rows into stacked card layout.

- [ ] **Step 4: Add loading.tsx to key routes**

Add `loading.tsx` skeletons to: `courses/`, `tasks/`, `grades/`, `calendar/`, `users/`.

- [ ] **Step 5: Final responsive pass**

Review all pages for responsive breakpoints per CLAUDE.md (lines 1735-1738):
- lg (>=1024): full sidebar, 4-col stats, 3-col courses
- md (768-1023): sidebar hidden, 2-col stats, 2-col courses
- sm (<768): single column, card stacks, modal full-width

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add loading skeletons, error boundaries, and responsive polish"
```

---

## Task 28: Final Verification

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run dev server and test all flows**

```bash
npm run dev
```

Test as each role:
1. **Teacher** (elena@proxima.edu): Dashboard → Courses → Course detail → Lesson → Tasks → Grade → Calendar → Hardware → Settings
2. **Student** (marcus@student.proxima.edu): Dashboard → Courses → Lesson viewer → Submit task → Grades → Calendar → Packages → Settings
3. **Admin** (admin@proxima.edu): Dashboard → Users → All pages

- [ ] **Step 3: Fix any issues found during testing**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve issues found during final verification"
```
