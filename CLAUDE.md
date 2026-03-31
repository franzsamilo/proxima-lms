# CLAUDE.md — Proxima LMS

## Project Overview

**Proxima LMS** is a specialized Learning Management System for robotics and technical education. It integrates hardware kit management, code submissions, and video demo reviews directly into the learning flow — unlike generic platforms like Canvas or Moodle.

**Stack:**
- **Next.js 16.2** (App Router, Turbopack default, async params/searchParams)
- **React 19.2** (Server Components by default)
- **TypeScript 5.x** (strict mode)
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **Prisma ORM 6.x** with PostgreSQL
- **Auth.js v5** (`next-auth@5`) with Credentials provider + Prisma adapter
- **Uploadthing** for file/video uploads
- **Monaco Editor** (`@monaco-editor/react`) for code editing
- **Zod** for validation
- **Lucide React** for icons
- **bcryptjs** for password hashing

---

## Critical Next.js 16 Patterns

These patterns are **mandatory** — Next.js 16 removed synchronous access entirely.

### Async Params and SearchParams

Every `page.tsx`, `layout.tsx`, and `route.ts` with dynamic segments must `await` params:

```tsx
// CORRECT — Next.js 16
export default async function Page(props: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await props.params
  // ...
}

// WRONG — will crash at runtime
export default async function Page({ params }: { params: { courseId: string } }) {
  const { courseId } = params // ERROR: params is a Promise
}
```

Same for `searchParams`:
```tsx
export default async function Page(props: {
  params: Promise<{ courseId: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { courseId } = await props.params
  const { page } = await props.searchParams
}
```

### Async Request APIs

`cookies()`, `headers()`, and `draftMode()` all return Promises:
```tsx
import { cookies } from 'next/headers'
const cookieStore = await cookies()
const token = cookieStore.get('auth-token')
```

### No `legacyBehavior` on `<Link>`

Removed in Next.js 16. Always use:
```tsx
<Link href="/about">About</Link>
// Never wrap <a> inside <Link>
```

### Middleware File

Next.js 16 uses `middleware.ts` (not `proxy.ts` — that rename was proposed but `middleware.ts` remains the standard).

### Caching

All pages are **dynamic by default** in Next.js 16. No implicit caching. Use `"use cache"` directive explicitly where you want caching.

---

## Directory Structure

```
proxima-lms/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                       # Landing page (public)
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── layout.tsx                 # Centered auth layout
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                 # Sidebar + topbar shell
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
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── grade-circle.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── confirmation-dialog.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx               # "use client" — handles active state, collapse
│   │   │   ├── topbar.tsx                # "use client" — search, notifications, user menu
│   │   │   └── mobile-nav.tsx            # "use client" — hamburger + slide-over
│   │   ├── dashboard/
│   │   │   ├── stats-grid.tsx            # Server component
│   │   │   ├── announcements-panel.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   └── upcoming-events.tsx
│   │   ├── courses/
│   │   │   ├── course-card.tsx
│   │   │   ├── course-list.tsx
│   │   │   ├── module-accordion.tsx      # "use client"
│   │   │   ├── lesson-item.tsx
│   │   │   ├── course-timeline.tsx
│   │   │   └── create-course-form.tsx    # "use client"
│   │   ├── lessons/
│   │   │   ├── slide-viewer.tsx          # "use client" — renders markdown
│   │   │   ├── code-editor.tsx           # "use client" — Monaco editor
│   │   │   ├── quiz-renderer.tsx         # "use client" — interactive quiz
│   │   │   └── task-submission.tsx       # "use client" — code/video upload
│   │   ├── tasks/
│   │   │   ├── task-table.tsx
│   │   │   ├── task-detail.tsx
│   │   │   ├── grading-form.tsx          # "use client"
│   │   │   ├── code-viewer.tsx
│   │   │   └── video-player.tsx          # "use client"
│   │   ├── grades/
│   │   │   ├── grade-summary-cards.tsx
│   │   │   ├── grade-table.tsx
│   │   │   └── grade-distribution-chart.tsx  # "use client"
│   │   ├── calendar/
│   │   │   ├── calendar-grid.tsx         # "use client"
│   │   │   ├── event-list.tsx
│   │   │   └── create-event-form.tsx     # "use client"
│   │   ├── packages/
│   │   │   └── package-card.tsx
│   │   ├── hardware/
│   │   │   ├── kit-card.tsx
│   │   │   └── assign-kit-modal.tsx      # "use client"
│   │   └── users/
│   │       ├── user-table.tsx
│   │       └── edit-user-modal.tsx        # "use client"
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── auth-helpers.ts
│   │   ├── validations.ts
│   │   ├── utils.ts
│   │   └── uploadthing.ts
│   ├── actions/
│   │   ├── course-actions.ts
│   │   ├── module-actions.ts
│   │   ├── lesson-actions.ts
│   │   ├── task-actions.ts
│   │   ├── grading-actions.ts
│   │   ├── calendar-actions.ts
│   │   ├── hardware-actions.ts
│   │   ├── user-actions.ts
│   │   └── announcement-actions.ts
│   ├── hooks/
│   │   ├── use-current-user.ts
│   │   └── use-toast.ts
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
├── public/
│   └── logo.svg
├── .env.example
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

---

## Initialization Commands

```bash
npx create-next-app@latest proxima-lms --typescript --tailwind --app --src-dir --turbopack
cd proxima-lms

# Core deps
npm install prisma @prisma/client next-auth@5 @auth/prisma-adapter bcryptjs zod lucide-react clsx tailwind-merge

# Editor + uploads
npm install @monaco-editor/react uploadthing @uploadthing/react

# Markdown rendering (for slide lessons)
npm install react-markdown remark-gfm

# Dev deps
npm install -D @types/bcryptjs tsx

npx prisma init
```

---

## Configuration Files

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
```

### `postcss.config.mjs`

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### `tsconfig.json`

Ensure `"strict": true` and paths alias `"@/*": ["./src/*"]` are set (create-next-app does this).

---

## Prisma Schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum SchoolLevel {
  ELEMENTARY
  HS
  COLLEGE
}

enum Tier {
  STARTER
  EXPLORER
  PROFESSIONAL
}

enum LessonType {
  SLIDES
  CODE
  QUIZ
  TASK
  VIDEO
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADED
  RETURNED
}

enum ModuleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ─── Auth.js v5 required models ───

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Application models ───

model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  passwordHash   String
  role           Role      @default(STUDENT)
  department     String?
  schoolLevel    SchoolLevel?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  accounts       Account[]
  sessions       Session[]
  taughtCourses  Course[]         @relation("Instructor")
  enrollments    Enrollment[]
  submissions    Submission[]
  announcements  Announcement[]   @relation("Author")
  kitAssignments HardwareAssignment[]
}

model Course {
  id              String      @id @default(cuid())
  title           String
  description     String      @db.Text
  level           SchoolLevel
  tier            Tier
  maxStudents     Int         @default(30)
  startDate       DateTime
  endDate         DateTime
  isPublished     Boolean     @default(false)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  instructorId    String
  instructor      User        @relation("Instructor", fields: [instructorId], references: [id])
  modules         Module[]
  enrollments     Enrollment[]
  events          CalendarEvent[]
  packageId       String?
  package         LessonPackage? @relation(fields: [packageId], references: [id])
}

model Enrollment {
  id          String   @id @default(cuid())
  enrolledAt  DateTime @default(now())
  progress    Float    @default(0)

  studentId   String
  student     User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  courseId     String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@unique([studentId, courseId])
}

model Module {
  id        String       @id @default(cuid())
  title     String
  order     Int
  status    ModuleStatus @default(DRAFT)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  courseId   String
  course    Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons   Lesson[]
}

model Lesson {
  id            String     @id @default(cuid())
  title         String
  type          LessonType
  order         Int
  durationMins  Int        @default(30)
  content       Json?
  codeSkeleton  String?    @db.Text
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  moduleId      String
  module        Module     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  submissions   Submission[]
}

model Submission {
  id            String           @id @default(cuid())
  status        SubmissionStatus @default(DRAFT)
  submittedAt   DateTime?
  gradedAt      DateTime?
  grade         Int?
  feedback      String?          @db.Text

  codeContent   String?          @db.Text
  videoUrl      String?
  quizAnswers   Json?
  fileUrl       String?

  studentId     String
  student       User             @relation(fields: [studentId], references: [id])
  lessonId      String
  lesson        Lesson           @relation(fields: [lessonId], references: [id])

  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@unique([studentId, lessonId])
}

model LessonPackage {
  id          String      @id @default(cuid())
  name        String
  level       SchoolLevel
  tier        Tier
  price       Float
  description String?     @db.Text
  includes    String[]
  isActive    Boolean     @default(true)

  courses     Course[]
}

model HardwareKit {
  id          String      @id @default(cuid())
  name        String
  level       SchoolLevel
  specs       String      @db.Text
  totalQty    Int
  imageEmoji  String      @default("🤖")

  assignments HardwareAssignment[]
}

model HardwareAssignment {
  id          String    @id @default(cuid())
  assignedAt  DateTime  @default(now())
  returnedAt  DateTime?

  kitId       String
  kit         HardwareKit @relation(fields: [kitId], references: [id])
  userId      String
  user        User        @relation(fields: [userId], references: [id])

  @@unique([kitId, userId])
}

model Announcement {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  priority  String   @default("normal")
  createdAt DateTime @default(now())

  authorId  String
  author    User     @relation("Author", fields: [authorId], references: [id])
}

model CalendarEvent {
  id       String   @id @default(cuid())
  title    String
  date     DateTime
  type     String

  courseId  String?
  course   Course?  @relation(fields: [courseId], references: [id])
}
```

---

## Auth.js v5 Configuration

### `src/lib/auth.ts`

```ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

### `src/types/next-auth.d.ts`

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

### `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### `src/app/api/auth/register/route.ts`

```ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role as any,
      schoolLevel: parsed.data.schoolLevel as any,
    },
  })

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
```

### `src/middleware.ts`

```ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname
  const isAuthPage = path.startsWith("/login") || path.startsWith("/register")
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/courses") ||
    path.startsWith("/lessons") ||
    path.startsWith("/tasks") ||
    path.startsWith("/grades") ||
    path.startsWith("/calendar") ||
    path.startsWith("/packages") ||
    path.startsWith("/hardware") ||
    path.startsWith("/users") ||
    path.startsWith("/settings")

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
}
```

### `src/lib/auth-helpers.ts`

```ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.user.findUnique({ where: { id: session.user.id } })
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as Role)) throw new Error("Forbidden")
  return user
}
```

### `src/lib/prisma.ts`

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## Zod Validation Schemas

File: `src/lib/validations.ts`

```ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "TEACHER"]),
  schoolLevel: z.enum(["ELEMENTARY", "HS", "COLLEGE"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  level: z.enum(["ELEMENTARY", "HS", "COLLEGE"]),
  maxStudents: z.number().int().min(1).max(200).default(30),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
})

export const createModuleSchema = z.object({
  title: z.string().min(2).max(100),
  courseId: z.string().cuid(),
})

export const createLessonSchema = z.object({
  title: z.string().min(2).max(100),
  type: z.enum(["SLIDES", "CODE", "QUIZ", "TASK", "VIDEO"]),
  durationMins: z.number().int().min(1).max(480).default(30),
  content: z.any().optional(),
  codeSkeleton: z.string().optional(),
  moduleId: z.string().cuid(),
})

export const submitTaskSchema = z.object({
  lessonId: z.string().cuid(),
  codeContent: z.string().optional(),
  videoUrl: z.string().url().optional(),
  quizAnswers: z.record(z.string()).optional(),
  fileUrl: z.string().url().optional(),
})

export const gradeTaskSchema = z.object({
  grade: z.number().int().min(0).max(100),
  feedback: z.string().max(2000).optional(),
})

export const createEventSchema = z.object({
  title: z.string().min(2).max(100),
  date: z.string().transform((s) => new Date(s)),
  type: z.enum(["deadline", "exam", "event"]),
  courseId: z.string().cuid().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
  department: z.string().optional(),
  schoolLevel: z.enum(["ELEMENTARY", "HS", "COLLEGE"]).nullable().optional(),
})
```

---

## Utility Functions

File: `src/lib/utils.ts`

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  })
}

export function getGradeColor(grade: number): string {
  if (grade >= 90) return "text-emerald-400"
  if (grade >= 80) return "text-blue-400"
  if (grade >= 70) return "text-amber-400"
  return "text-red-400"
}

export function getGradeBgColor(grade: number): string {
  if (grade >= 90) return "bg-emerald-400/10 border-emerald-400/20"
  if (grade >= 80) return "bg-blue-400/10 border-blue-400/20"
  if (grade >= 70) return "bg-amber-400/10 border-amber-400/20"
  return "bg-red-400/10 border-red-400/20"
}

export function getGradeLabel(grade: number): string {
  if (grade >= 90) return "Excellent"
  if (grade >= 80) return "Good"
  if (grade >= 70) return "Satisfactory"
  return "Needs Improvement"
}

export function getLevelColor(level: string): string {
  switch (level) {
    case "ELEMENTARY": return "#10B981"
    case "HS": return "#3B82F6"
    case "COLLEGE": return "#8B5CF6"
    default: return "#64748B"
  }
}

export function getTierFromLevel(level: string): "STARTER" | "EXPLORER" | "PROFESSIONAL" {
  switch (level) {
    case "ELEMENTARY": return "STARTER"
    case "HS": return "EXPLORER"
    case "COLLEGE": return "PROFESSIONAL"
    default: return "STARTER"
  }
}
```

---

## Seed Data

File: `prisma/seed.ts`

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

The seed file must create all data below. Every `prisma.create` call is written out — no placeholders.

```ts
import { PrismaClient, Role, SchoolLevel, Tier, LessonType, ModuleStatus, SubmissionStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.submission.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.module.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.hardwareAssignment.deleteMany()
  await prisma.hardwareKit.deleteMany()
  await prisma.course.deleteMany()
  await prisma.lessonPackage.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("password123", 12)

  // ─── Users ───
  const teacher = await prisma.user.create({
    data: { name: "Dr. Elena Vasquez", email: "elena@proxima.edu", passwordHash, role: Role.TEACHER, department: "Robotics Engineering" },
  })
  const student = await prisma.user.create({
    data: { name: "Marcus Chen", email: "marcus@student.proxima.edu", passwordHash, role: Role.STUDENT, schoolLevel: SchoolLevel.COLLEGE },
  })
  const student2 = await prisma.user.create({
    data: { name: "Aisha Patel", email: "aisha@student.proxima.edu", passwordHash, role: Role.STUDENT, schoolLevel: SchoolLevel.HS },
  })
  const student3 = await prisma.user.create({
    data: { name: "Jake Morrison", email: "jake@student.proxima.edu", passwordHash, role: Role.STUDENT, schoolLevel: SchoolLevel.ELEMENTARY },
  })
  const admin = await prisma.user.create({
    data: { name: "System Admin", email: "admin@proxima.edu", passwordHash, role: Role.ADMIN },
  })

  // ─── Lesson Packages ───
  const pkgStarter = await prisma.lessonPackage.create({
    data: { name: "RoboStarter Kit", level: SchoolLevel.ELEMENTARY, tier: Tier.STARTER, price: 299, description: "Foundational robotics curriculum for elementary learners. Covers basic robot anatomy, sensors, and simple programming with block-based and Python hybrid approaches.", includes: ["Slide decks", "Code skeletons", "Quizzes", "Hardware setup guide"] },
  })
  const pkgExplorer = await prisma.lessonPackage.create({
    data: { name: "Explorer Toolkit", level: SchoolLevel.HS, tier: Tier.EXPLORER, price: 499, description: "Intermediate robotics and Python programming for high school students. Includes computer vision, autonomous navigation, and project-based assessments.", includes: ["Slide decks", "Code skeletons", "Quizzes", "Video tutorials", "Project briefs", "Hardware setup guide"] },
  })
  const pkgPro = await prisma.lessonPackage.create({
    data: { name: "ProBot Suite", level: SchoolLevel.COLLEGE, tier: Tier.PROFESSIONAL, price: 799, description: "Advanced robotics engineering curriculum covering kinematics, PID control, ROS2, and multi-DOF manipulation. Designed for university-level courses.", includes: ["Slide decks", "Code skeletons", "Quizzes", "Video tutorials", "Project briefs", "Research papers", "Lab manuals", "Hardware setup guide"] },
  })

  // ─── Courses ───
  const course1 = await prisma.course.create({
    data: { title: "Introduction to Robotics", description: "Foundational concepts in robotics, sensors, and basic movement programming. Students learn to identify robot components, write simple motor control programs, and build a line-following robot.", level: SchoolLevel.ELEMENTARY, tier: Tier.STARTER, maxStudents: 40, startDate: new Date("2026-01-12"), endDate: new Date("2026-05-22"), isPublished: true, instructorId: teacher.id, packageId: pkgStarter.id },
  })
  const course2 = await prisma.course.create({
    data: { title: "Advanced Kinematics & Control", description: "Inverse kinematics, PID control, and multi-DOF arm manipulation. Students implement forward kinematics solvers, tune PID controllers, and program robotic arms for pick-and-place tasks.", level: SchoolLevel.COLLEGE, tier: Tier.PROFESSIONAL, maxStudents: 25, startDate: new Date("2026-01-12"), endDate: new Date("2026-05-22"), isPublished: true, instructorId: teacher.id, packageId: pkgPro.id },
  })
  const course3 = await prisma.course.create({
    data: { title: "Robot Programming with Python", description: "Python-based robot control, computer vision basics, and autonomous navigation. Students progress from basic syntax to writing autonomous navigation algorithms.", level: SchoolLevel.HS, tier: Tier.EXPLORER, maxStudents: 35, startDate: new Date("2026-02-03"), endDate: new Date("2026-06-12"), isPublished: true, instructorId: teacher.id, packageId: pkgExplorer.id },
  })

  // ─── Enrollments ───
  await prisma.enrollment.createMany({
    data: [
      { studentId: student.id, courseId: course1.id, progress: 28 },
      { studentId: student.id, courseId: course2.id, progress: 42 },
      { studentId: student.id, courseId: course3.id, progress: 65 },
      { studentId: student2.id, courseId: course3.id, progress: 50 },
      { studentId: student3.id, courseId: course1.id, progress: 15 },
    ],
  })

  // ─── Course 1 Modules & Lessons ───
  const mod1 = await prisma.module.create({ data: { title: "Robot Anatomy", order: 1, status: ModuleStatus.PUBLISHED, courseId: course1.id } })

  const l1 = await prisma.lesson.create({ data: { title: "Parts of a Robot", type: LessonType.SLIDES, order: 1, durationMins: 30, moduleId: mod1.id,
    content: { slides: [
      { title: "What is a Robot?", body: "A robot is a programmable machine capable of carrying out actions autonomously or semi-autonomously. Robots combine **sensors** (to perceive), **actuators** (to act), and a **controller** (to decide)." },
      { title: "The Controller", body: "The controller is the brain of the robot. It is typically a microcontroller (like Arduino) or a single-board computer (like Raspberry Pi). It reads sensor data, runs your program, and sends signals to actuators." },
      { title: "Sensors", body: "Sensors let the robot perceive its environment:\n- **Ultrasonic sensor**: measures distance using sound waves\n- **Infrared sensor**: detects proximity and line edges\n- **Light sensor**: measures ambient light levels\n- **Touch/bumper sensor**: detects physical contact" },
      { title: "Actuators", body: "Actuators are the muscles of the robot:\n- **DC motors**: provide continuous rotation for wheels\n- **Servo motors**: rotate to precise angles for arms/grippers\n- **Stepper motors**: precise rotational control\n- **LEDs and buzzers**: visual and audio output" },
      { title: "Chassis & Frame", body: "The chassis holds everything together. Common materials include acrylic, aluminum, and 3D-printed plastic. The design depends on the robot's purpose — wheeled platforms for mobility, arm bases for manipulation." },
      { title: "Power Supply", body: "Robots need power! Common options:\n- **AA batteries**: simple, replaceable\n- **LiPo batteries**: rechargeable, high energy density\n- **USB power**: for stationary/tethered robots\n\nAlways check voltage requirements before connecting!" },
      { title: "Putting It All Together", body: "A complete robot system:\n1. Power supply provides energy\n2. Controller runs your program\n3. Sensors feed data to the controller\n4. Controller decides actions\n5. Actuators execute movements\n\nIn the next lesson, we'll explore each sensor type in detail." }
    ] },
  } })

  const l2 = await prisma.lesson.create({ data: { title: "Sensors Overview", type: LessonType.SLIDES, order: 2, durationMins: 25, moduleId: mod1.id,
    content: { slides: [
      { title: "Why Sensors Matter", body: "Without sensors, a robot is blind. Sensors transform physical phenomena (light, sound, distance, touch) into electrical signals the controller can read." },
      { title: "Ultrasonic Sensors", body: "Emit sound pulses and measure the echo return time to calculate distance. Range: 2cm-400cm. Common model: HC-SR04.\n\n**Use cases**: obstacle avoidance, distance measurement, parking assist" },
      { title: "Infrared Sensors", body: "Two types:\n- **Proximity IR**: detects objects within ~30cm using reflected IR light\n- **Line-following IR**: detects dark vs light surfaces (used for line-following robots)\n\nFast response time but affected by ambient light." },
      { title: "Other Sensors", body: "- **Gyroscope/Accelerometer (IMU)**: measures orientation and motion\n- **Color sensor**: identifies colors\n- **Temperature sensor**: monitors heat\n- **Encoder**: counts wheel rotations for precise distance tracking" },
      { title: "Choosing the Right Sensor", body: "Match the sensor to the task:\n- Need to avoid walls? → Ultrasonic\n- Following a line? → IR reflectance\n- Measuring rotation? → Encoder\n- Balancing? → IMU\n\nNext: test your knowledge with a quiz!" }
    ] },
  } })

  const l3 = await prisma.lesson.create({ data: { title: "Identify Components Quiz", type: LessonType.QUIZ, order: 3, durationMins: 15, moduleId: mod1.id,
    content: { questions: [
      { id: "q1", question: "What is the 'brain' of a robot called?", options: ["Actuator", "Controller", "Sensor", "Chassis"], correctIndex: 1 },
      { id: "q2", question: "Which sensor uses sound waves to measure distance?", options: ["Ultrasonic", "Infrared", "Gyroscope", "Encoder"], correctIndex: 0 },
      { id: "q3", question: "What type of motor is best for precise angular positioning?", options: ["DC motor", "Stepper motor", "Servo motor", "Linear actuator"], correctIndex: 2 },
      { id: "q4", question: "Which component converts electrical energy into physical motion?", options: ["Sensor", "Controller", "Power supply", "Actuator"], correctIndex: 3 },
      { id: "q5", question: "What does an IR reflectance sensor detect?", options: ["Sound waves", "Light vs dark surfaces", "Temperature", "Magnetic fields"], correctIndex: 1 },
    ] },
  } })

  const mod2 = await prisma.module.create({ data: { title: "Basic Movement", order: 2, status: ModuleStatus.PUBLISHED, courseId: course1.id } })

  const l4 = await prisma.lesson.create({ data: { title: "Motor Control Basics", type: LessonType.SLIDES, order: 1, durationMins: 35, moduleId: mod2.id,
    content: { slides: [
      { title: "How DC Motors Work", body: "DC motors convert electrical energy into rotational motion. By varying voltage, we control speed. By reversing polarity, we reverse direction." },
      { title: "Motor Drivers", body: "Microcontrollers can't power motors directly — they need motor drivers (like L298N or L293D). The driver acts as a bridge between the low-power controller and the high-power motor." },
      { title: "PWM Speed Control", body: "Pulse Width Modulation (PWM) controls motor speed by rapidly switching power on/off. A 50% duty cycle = half speed. Most controllers output PWM on specific pins." },
      { title: "Differential Drive", body: "Two-wheeled robots use differential drive:\n- Both motors forward = drive straight\n- Left motor slower = turn left\n- Motors opposite directions = spin in place\n\nThis is the most common drive system for educational robots." },
      { title: "Your First Program", body: "In the next lesson, you'll write code to:\n1. Drive forward for 2 seconds\n2. Turn left 90 degrees\n3. Drive forward for 1 second\n4. Stop\n\nGet your robot kit ready!" }
    ] },
  } })

  const l5 = await prisma.lesson.create({ data: { title: "Your First Drive Program", type: LessonType.CODE, order: 2, durationMins: 45, moduleId: mod2.id,
    codeSkeleton: "import robot\n\nSPEED = 50\n\ndef drive_forward(speed=SPEED):\n    \"\"\"Drive both motors forward at given speed.\"\"\"\n    # TODO: Set left and right motors to 'speed'\n    pass\n\ndef turn_left(degrees):\n    \"\"\"Turn the robot left by the given degrees.\"\"\"\n    # TODO: Spin motors in opposite directions\n    pass\n\ndef stop():\n    \"\"\"Stop all motors.\"\"\"\n    # TODO: Set both motors to 0\n    pass\n\n# Main Sequence\n# 1. Drive forward for 2 seconds\n# 2. Turn left 90 degrees\n# 3. Drive forward for 1 second\n# 4. Stop the robot\n",
    content: { brief: "Write a program to drive your robot in an L-shaped path. Complete the function stubs to control the motors, then execute the main sequence.", hints: ["Use robot.left_motor(speed) and robot.right_motor(speed)", "Use robot.wait(seconds) to pause", "For turning, try opposite speeds (-30 and 30)"] },
  } })

  const l6 = await prisma.lesson.create({ data: { title: "Line Following Challenge", type: LessonType.TASK, order: 3, durationMins: 60, moduleId: mod2.id,
    content: { brief: "Program your robot to follow a black line on a white surface using IR reflectance sensors. Your robot must complete a full loop without leaving the line.",
      requirements: ["Robot must follow the line autonomously", "Must handle at least one 90-degree turn", "Must complete the course within 2 minutes", "Submit your code AND a video recording"],
      rubric: { "Code quality (30pts)": "Clean code, proper functions, comments", "Line following accuracy (30pts)": "Stays on line, handles curves", "Turn handling (20pts)": "Successfully navigates turns", "Video demo (20pts)": "Clear video showing full course completion" } },
  } })

  const mod3 = await prisma.module.create({ data: { title: "Sensor Integration", order: 3, status: ModuleStatus.DRAFT, courseId: course1.id } })

  const l7 = await prisma.lesson.create({ data: { title: "Reading Sensor Data", type: LessonType.SLIDES, order: 1, durationMins: 30, moduleId: mod3.id,
    content: { slides: [
      { title: "Analog vs Digital", body: "Digital sensors return 0 or 1. Analog sensors return a range (0-1023 on Arduino)." },
      { title: "Reading in Code", body: "Use robot.read_sensor(port), robot.read_distance(), and robot.read_line()." },
      { title: "Filtering Noise", body: "Techniques: averaging, thresholding, debouncing." }
    ] },
  } })

  const l8 = await prisma.lesson.create({ data: { title: "Obstacle Avoidance Code", type: LessonType.CODE, order: 2, durationMins: 50, moduleId: mod3.id,
    codeSkeleton: "import robot\n\nSAFE_DISTANCE = 20\nSPEED = 40\n\ndef avoid_obstacle():\n    distance = robot.read_distance()\n    if distance < SAFE_DISTANCE:\n        # TODO: Stop, turn, proceed\n        pass\n    else:\n        # TODO: Drive forward\n        pass\n\nwhile True:\n    avoid_obstacle()\n    robot.wait(0.1)\n",
    content: { brief: "Implement obstacle avoidance using the ultrasonic sensor.", hints: ["Read distance before each move", "Stop, turn right ~90 degrees, check again"] },
  } })

  const l9 = await prisma.lesson.create({ data: { title: "Navigate the Maze", type: LessonType.TASK, order: 3, durationMins: 90, moduleId: mod3.id,
    content: { brief: "Program your robot to navigate a simple maze autonomously.",
      requirements: ["Use ultrasonic sensor for wall detection", "Navigate at least 3 turns", "No pre-programmed paths", "Submit code and video"],
      rubric: { "Algorithm design (35pts)": "Smart decisions, handles dead ends", "Sensor usage (25pts)": "Effective sensor use", "Code quality (20pts)": "Clean and documented", "Video demo (20pts)": "Shows maze navigation" } },
  } })

  // ─── Course 2 Modules & Lessons ───
  const mod4 = await prisma.module.create({ data: { title: "Forward Kinematics", order: 1, status: ModuleStatus.PUBLISHED, courseId: course2.id } })

  const l10 = await prisma.lesson.create({ data: { title: "DH Parameters", type: LessonType.SLIDES, order: 1, durationMins: 45, moduleId: mod4.id,
    content: { slides: [
      { title: "DH Convention", body: "The Denavit-Hartenberg convention assigns coordinate frames to each link using four parameters: theta (joint angle), d (link offset), a (link length), alpha (link twist)." },
      { title: "DH Parameter Table", body: "For a 3-DOF planar arm:\n\n| Joint | theta | d | a | alpha |\n|---|---|---|---|---|\n| 1 | theta1 | 0 | L1 | 0 |\n| 2 | theta2 | 0 | L2 | 0 |\n| 3 | theta3 | 0 | L3 | 0 |" },
      { title: "Transformation Matrix", body: "Each joint's DH params define a 4x4 homogeneous transformation. Chain all: T = T1 * T2 * ... * Tn" },
      { title: "Next: Implementation", body: "In the lab, you'll build a FK solver in Python using NumPy." }
    ] },
  } })

  const l11 = await prisma.lesson.create({ data: { title: "FK Solver Lab", type: LessonType.CODE, order: 2, durationMins: 60, moduleId: mod4.id,
    codeSkeleton: "import numpy as np\n\ndef dh_transform(theta, d, a, alpha):\n    \"\"\"Compute 4x4 DH transformation matrix.\"\"\"\n    # TODO: Implement\n    pass\n\ndef forward_kinematics(dh_params):\n    \"\"\"Chain DH transforms for end-effector pose.\"\"\"\n    # TODO: Implement\n    pass\n\n# Test: 2-DOF planar arm\nL1, L2 = 1.0, 0.8\ntheta1 = np.radians(45)\ntheta2 = np.radians(30)\nT = forward_kinematics([(theta1, 0, L1, 0), (theta2, 0, L2, 0)])\nprint(f\"End-effector: x={T[0,3]:.3f}, y={T[1,3]:.3f}\")\nprint(f\"Expected: x=0.400, y=1.169\")\n",
    content: { brief: "Implement a forward kinematics solver using DH parameters and NumPy.", hints: ["Use the 4x4 DH matrix formula", "Chain with matrix multiplication: T = T @ T_new", "Test with known joint angles"] },
  } })

  const mod5 = await prisma.module.create({ data: { title: "PID Control", order: 2, status: ModuleStatus.PUBLISHED, courseId: course2.id } })

  const l12 = await prisma.lesson.create({ data: { title: "PID Theory", type: LessonType.SLIDES, order: 1, durationMins: 40, moduleId: mod5.id,
    content: { slides: [
      { title: "What is PID?", body: "PID is a control loop mechanism: Proportional, Integral, Derivative. The most widely used controller in robotics." },
      { title: "The Three Terms", body: "P: proportional to current error. I: accumulated past error. D: rate of error change." },
      { title: "The Equation", body: "output = Kp*e(t) + Ki*integral(e) + Kd*de/dt" },
      { title: "Tuning", body: "Start with Ki=0, Kd=0. Increase Kp until oscillation. Add Kd to dampen. Add Ki for steady-state error." }
    ] },
  } })

  const l13 = await prisma.lesson.create({ data: { title: "PID Tuning Challenge", type: LessonType.TASK, order: 2, durationMins: 90, moduleId: mod5.id,
    content: { brief: "Implement and tune a PID controller for robot arm position control. Settle within +-2 degrees of target.",
      requirements: ["PID class with configurable Kp, Ki, Kd", "Integral windup protection", "Demonstrate 3 target positions", "Plot error over time", "Submit code, tuning values, and video"],
      rubric: { "PID implementation (30pts)": "Correct formula, windup protection", "Tuning quality (30pts)": "Fast settling, minimal overshoot", "Documentation (20pts)": "Clear tuning explanation", "Video demo (20pts)": "Smooth arm movement" } },
  } })

  // ─── Course 3 Modules & Lessons ───
  const mod6 = await prisma.module.create({ data: { title: "Python Foundations", order: 1, status: ModuleStatus.PUBLISHED, courseId: course3.id } })

  const l14 = await prisma.lesson.create({ data: { title: "Variables & Loops for Robots", type: LessonType.SLIDES, order: 1, durationMins: 35, moduleId: mod6.id,
    content: { slides: [
      { title: "Why Python?", body: "Python is readable, has powerful libraries (NumPy, OpenCV), and lets you focus on algorithms." },
      { title: "Variables", body: "Variables store sensor readings, speeds, and state:\nspeed = 50\ndistance = robot.read_distance()\nis_moving = True" },
      { title: "While Loops", body: "Robots run in continuous loops:\nwhile True:\n    distance = robot.read_distance()\n    if distance < 20:\n        robot.stop()\n    else:\n        robot.drive(50)" },
      { title: "For Loops", body: "For repeating actions:\nfor i in range(5):\n    robot.led('green')\n    time.sleep(0.5)\n    robot.led('off')\n    time.sleep(0.5)" }
    ] },
  } })

  const l15 = await prisma.lesson.create({ data: { title: "Hello Robot Program", type: LessonType.CODE, order: 2, durationMins: 40, moduleId: mod6.id,
    codeSkeleton: "import robot\nimport time\n\ndef greet():\n    \"\"\"Greet with lights and sound.\"\"\"\n    # TODO: Print greeting, LED green, beep, wait, LED off\n    pass\n\ndef dance():\n    \"\"\"Simple dance routine.\"\"\"\n    # TODO: Spin right 0.5s, left 0.5s, forward 0.3s, back 0.3s. Repeat 3x.\n    pass\n\ndef sensor_check():\n    \"\"\"Read and display sensors.\"\"\"\n    # TODO: Read distance and line sensors, print values\n    pass\n\nprint(\"=== Hello Robot ===\")\ngreet()\ndance()\nsensor_check()\nprint(\"=== Done ===\")\n",
    content: { brief: "Write your first complete robot program with LED, motor, sound, and sensor functions.", hints: ["robot.led('green')/robot.led('off')", "robot.beep(440, 500)", "robot.left_motor(speed)/robot.right_motor(speed)", "robot.read_distance() returns cm", "time.sleep(seconds) for delays"] },
  } })

  // ─── Submissions ───
  await prisma.submission.create({ data: { status: SubmissionStatus.SUBMITTED, submittedAt: new Date("2026-03-28T14:30:00Z"), videoUrl: "https://uploads.proxima.edu/demos/line_follow_marcus.mp4", studentId: student.id, lessonId: l6.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.GRADED, submittedAt: new Date("2026-03-25T09:15:00Z"), gradedAt: new Date("2026-03-26T10:00:00Z"), grade: 92, feedback: "Excellent motor control logic. Consider adding error handling for sensor disconnects. The turn function works well but could be more precise with encoder feedback.", codeContent: "import robot\n\ndef drive_forward(speed=50):\n    robot.left_motor(speed)\n    robot.right_motor(speed)\n\ndef turn_left(angle):\n    robot.left_motor(-30)\n    robot.right_motor(30)\n    robot.wait(angle / 90)\n    robot.stop()\n\ndef stop():\n    robot.left_motor(0)\n    robot.right_motor(0)\n\ndrive_forward()\nrobot.wait(2)\nturn_left(90)\ndrive_forward()\nrobot.wait(1)\nstop()", studentId: student.id, lessonId: l5.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.SUBMITTED, submittedAt: new Date("2026-03-30T16:45:00Z"), codeContent: "import numpy as np\n\ndef dh_transform(theta, d, a, alpha):\n    ct, st = np.cos(theta), np.sin(theta)\n    ca, sa = np.cos(alpha), np.sin(alpha)\n    return np.array([[ct, -st*ca, st*sa, a*ct],[st, ct*ca, -ct*sa, a*st],[0, sa, ca, d],[0, 0, 0, 1]])\n\ndef forward_kinematics(dh_params):\n    T = np.eye(4)\n    for p in dh_params:\n        T = T @ dh_transform(*p)\n    return T\n\nL1, L2 = 1.0, 0.8\nT = forward_kinematics([(np.radians(45), 0, L1, 0), (np.radians(30), 0, L2, 0)])\nprint(f\"x={T[0,3]:.3f}, y={T[1,3]:.3f}\")", studentId: student.id, lessonId: l11.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.GRADED, submittedAt: new Date("2026-03-20T11:00:00Z"), gradedAt: new Date("2026-03-21T09:30:00Z"), grade: 88, feedback: "Good work! Review actuator types — you confused stepper and servo motors on Q3.", quizAnswers: { q1: "B", q2: "A", q3: "C", q4: "D", q5: "B" }, studentId: student.id, lessonId: l3.id } })
  await prisma.submission.create({ data: { status: SubmissionStatus.GRADED, submittedAt: new Date("2026-03-22T13:20:00Z"), gradedAt: new Date("2026-03-23T08:00:00Z"), grade: 95, feedback: "Clean code structure with excellent use of functions. The dance routine is creative!", codeContent: "import robot\nimport time\n\ndef greet():\n    print('Hello, Robot!')\n    robot.led('green')\n    robot.beep(440, 500)\n    time.sleep(1)\n    robot.led('off')\n\ndef dance():\n    for i in range(3):\n        robot.left_motor(40)\n        robot.right_motor(-40)\n        time.sleep(0.5)\n        robot.left_motor(-40)\n        robot.right_motor(40)\n        time.sleep(0.5)\n        robot.left_motor(30)\n        robot.right_motor(30)\n        time.sleep(0.3)\n        robot.left_motor(-30)\n        robot.right_motor(-30)\n        time.sleep(0.3)\n    robot.left_motor(0)\n    robot.right_motor(0)\n\ndef sensor_check():\n    dist = robot.read_distance()\n    line = robot.read_line()\n    print(f'Distance: {dist}cm')\n    print(f'Line: {\"black\" if line == 0 else \"white\"}')\n    if dist < 30:\n        print('Warning: obstacle nearby!')\n\nprint('=== Hello Robot ===')\ngreet()\ndance()\nsensor_check()\nprint('=== Done ===')", studentId: student.id, lessonId: l15.id } })

  // ─── Hardware Kits ───
  const kit1 = await prisma.hardwareKit.create({ data: { name: "Proxima Scout", level: SchoolLevel.ELEMENTARY, specs: "2-wheel differential drive, 3 sensors (ultrasonic, 2x IR line), LED array, buzzer, Arduino Nano controller, AA battery pack", totalQty: 45, imageEmoji: "🤖" } })
  const kit2 = await prisma.hardwareKit.create({ data: { name: "Proxima Ranger", level: SchoolLevel.HS, specs: "4-wheel mecanum drive, camera module, 6 sensors (ultrasonic, IR, IMU, color, 2x encoder), gripper, Raspberry Pi 4, LiPo battery", totalQty: 30, imageEmoji: "🦾" } })
  const kit3 = await prisma.hardwareKit.create({ data: { name: "Proxima Apex", level: SchoolLevel.COLLEGE, specs: "6-DOF robotic arm, LIDAR, stereo vision, force/torque sensor, ROS2-compatible, Jetson Nano, 24V power supply", totalQty: 20, imageEmoji: "🦿" } })

  await prisma.hardwareAssignment.createMany({ data: [
    { kitId: kit1.id, userId: student3.id },
    { kitId: kit2.id, userId: student2.id },
    { kitId: kit3.id, userId: student.id },
  ] })

  // ─── Announcements ───
  await prisma.announcement.createMany({ data: [
    { title: "Robotics Fair Registration Open", content: "Sign up for the annual robotics fair by April 15th. Showcase your semester projects! Teams of up to 3. Prizes for Best in Show, Most Innovative, and People's Choice.", priority: "high", authorId: teacher.id },
    { title: "Lab Hours Extended", content: "The robotics lab (Room 204) will be open until 9 PM on weekdays starting next week. Weekend hours: 10 AM - 5 PM. Sign the log sheet when entering.", priority: "normal", authorId: admin.id },
    { title: "New Sensor Kits Available", content: "We've received 15 new ultrasonic sensor kits and 10 infrared sensor arrays. See the lab technician (Ms. Rodriguez, Room 206) to check one out.", priority: "normal", authorId: teacher.id },
  ] })

  // ─── Calendar Events ───
  await prisma.calendarEvent.createMany({ data: [
    { title: "Line Following Challenge Due", date: new Date("2026-04-05"), type: "deadline", courseId: course1.id },
    { title: "FK Solver Lab Due", date: new Date("2026-04-08"), type: "deadline", courseId: course2.id },
    { title: "Midterm Exam — Intro to Robotics", date: new Date("2026-04-14"), type: "exam", courseId: course1.id },
    { title: "Annual Robotics Fair", date: new Date("2026-04-20"), type: "event" },
    { title: "PID Tuning Challenge Due", date: new Date("2026-04-22"), type: "deadline", courseId: course2.id },
    { title: "Final Projects Due — All Courses", date: new Date("2026-05-15"), type: "deadline" },
  ] })

  console.log("✅ Seed complete")
  console.log("Demo accounts (password: password123):")
  console.log("  Teacher:  elena@proxima.edu")
  console.log("  Student:  marcus@student.proxima.edu")
  console.log("  Student:  aisha@student.proxima.edu")
  console.log("  Student:  jake@student.proxima.edu")
  console.log("  Admin:    admin@proxima.edu")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
```

---

## API Route Specifications

All dynamic API routes must use the Next.js 16 async params pattern:

```ts
export async function GET(
  request: Request,
  props: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await props.params
  // ...
}
```

### Route Behaviors

| Method | Route | Auth | Behavior |
|--------|-------|------|----------|
| GET | `/api/courses` | Any | Students: enrolled courses (via Enrollment join). Teachers: their courses. Admins: all. Supports `?level=` and `?search=` |
| POST | `/api/courses` | Teacher, Admin | Create course. Validate `createCourseSchema`. Auto-set `instructorId`, `tier` from `getTierFromLevel()`, `isPublished: false` |
| GET | `/api/courses/[courseId]` | Enrolled/Instructor/Admin | Course with nested modules → lessons. Include `_count` of enrollments |
| PATCH | `/api/courses/[courseId]` | Instructor/Admin | Partial update |
| DELETE | `/api/courses/[courseId]` | Instructor/Admin | Delete with cascade |
| POST | `/api/courses/[courseId]/enroll` | Student | Check `maxStudents`. Prevent duplicate. Create `Enrollment` with `progress: 0` |
| POST | `/api/courses/[courseId]/modules` | Instructor/Admin | Create module. Auto-set `order` = max+1 |
| PATCH | `/api/modules/[moduleId]` | Instructor/Admin | Update title, order, status |
| DELETE | `/api/modules/[moduleId]` | Instructor/Admin | Cascade to lessons |
| POST | `/api/modules/[moduleId]/lessons` | Instructor/Admin | Create lesson. Auto-set order. Validate `createLessonSchema` |
| GET | `/api/lessons/[lessonId]` | Enrolled/Instructor/Admin | Full lesson content. For students: include their submission if exists |
| PATCH | `/api/lessons/[lessonId]` | Instructor/Admin | Update content/metadata |
| GET | `/api/tasks` | Any | Students: their submissions. Teachers: submissions for their courses. Supports `?status=`, `?courseId=`. Include lesson title and student name |
| POST | `/api/tasks` | Student | Upsert on `[studentId, lessonId]`. Set `status: SUBMITTED`, `submittedAt: now()`. Validate `submitTaskSchema` |
| GET | `/api/tasks/[taskId]` | Owner/Instructor/Admin | Full submission detail |
| PATCH | `/api/tasks/[taskId]/grade` | Instructor/Admin | Validate `gradeTaskSchema`. Set `status: GRADED`, `gradedAt: now()` |
| GET | `/api/packages` | Any | List active packages |
| GET | `/api/hardware` | Teacher/Admin | Kits with active assignment count (`returnedAt` is null) |
| POST | `/api/hardware/assign` | Teacher/Admin | `{ kitId, userId }`. Check availability. Create assignment |
| GET | `/api/users` | Admin | All users. Supports `?role=`, `?search=`. Include `_count` enrollments |
| PATCH | `/api/users/[userId]` | Admin | Update role, department, schoolLevel |
| GET | `/api/calendar` | Any | Events filtered by role's enrolled courses + null courseId events. Supports `?month=YYYY-MM` |
| POST | `/api/calendar` | Teacher/Admin | Validate `createEventSchema` |
| GET | `/api/announcements` | Any | All, ordered by `createdAt` desc |
| POST | `/api/announcements` | Teacher/Admin | `{ title, content, priority }` |

---

## Server Actions

File pattern: `src/actions/*.ts` — each starts with `"use server"`.

Use Server Actions for mutations from forms/buttons. Each action: validates input with Zod, checks auth with `requireRole()`, performs Prisma mutation, calls `revalidatePath()`.

Pattern:
```ts
"use server"
import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createCourseSchema } from "@/lib/validations"
import { getTierFromLevel } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function createCourse(formData: FormData) {
  const user = await requireRole(["TEACHER", "ADMIN"])
  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    level: formData.get("level"),
    maxStudents: Number(formData.get("maxStudents")),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  })
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }
  const course = await prisma.course.create({
    data: { ...parsed.data, tier: getTierFromLevel(parsed.data.level), instructorId: user.id },
  })
  revalidatePath("/courses")
  return { success: true, courseId: course.id }
}
```

---

## Page Specifications

### Landing Page (`src/app/page.tsx`)
Public. Dark bg. Centered hero: large Proxima logo (teal gradient), "PROXIMA" title in Syne 800 with 6px letter-spacing and gradient text, "Robotics Learning Management System" subtitle in Outfit, value prop paragraph, two CTA buttons ("Sign In" → /login, "Learn More" scrolls). Feature cards section: "Integrated Hardware Kits", "Code & Video Submissions", "Curriculum Packages". Footer.

### Login (`/login`)
Logo + title. Email/password inputs. Sign In button calls `signIn("credentials", { email, password, redirectTo: "/dashboard" })`. Link to `/register`. Error display from `searchParams.error`. Demo hint: "Demo: elena@proxima.edu / password123".

### Register (`/register`)
Name, email, password, confirm password. Role toggle (Student/Teacher). If Student: school level dropdown. POST to `/api/auth/register`, then auto sign in.

### Dashboard Layout (`(dashboard)/layout.tsx`)
Server component. Fetch current user. Render `<Sidebar user={user}>` + `<Topbar user={user}>` + `<main>{children}</main>`.

### Dashboard (`/dashboard`)
Role-adaptive stats grid + announcements + recent activity + upcoming events. **Student**: Enrolled Courses, Pending Tasks, Average Grade, Progress. **Teacher**: Active Courses, Pending Reviews, Total Students, Completion Rate. **Admin**: Total Courses, Active Users, Hardware Kits, Packages.

### Courses (`/courses`)
Grid of course cards. Each: title, level/tier badges, description, module/lesson count, progress bar, instructor, enrollment count. Teachers: "New Course" button → `/courses/new`.

### Course Detail (`/courses/[courseId]`)
Async params. Header, progress bar, timeline, module accordion. Lessons show icon by type/status. Teachers: edit/add buttons. Students: click lessons → `/lessons/[lessonId]`.

### Lesson Viewer (`/lessons/[lessonId]`)
Switch on `lesson.type`: SLIDES → `<SlideViewer>` with react-markdown. CODE → `<CodeEditor>` with Monaco. QUIZ → `<QuizRenderer>` with radio buttons. TASK → `<TaskSubmission>` with code textarea + video upload.

### Tasks (`/tasks`)
Tabs: All / Pending / Graded. Table: Task, Student (teacher), Type, Status, Submitted, Grade. Links to `/tasks/[taskId]`.

### Task Detail (`/tasks/[taskId]`)
Code viewer / video player / quiz answers. Grade + feedback if graded. Grading form if teacher + ungraded.

### Grades (`/grades`)
Summary cards per course, full grade table, grade distribution bar chart.

### Calendar (`/calendar`)
Month grid with event dots. Event list. Teachers: "Add Event" modal.

### Packages (`/packages`)
3 package cards with level badge, price, module/lesson counts, includes checklist, Subscribe button.

### Hardware (`/hardware`)
Kit cards with emoji, name, specs, quantity stats, "Assign Kit" modal.

### Users (`/users`) — Admin only
User table: Name, Email, Role, Level, Courses, Joined. Edit role modal.

### Settings (`/settings`)
Profile form (name, email, department). Password change.

---

## UI Design System — "Observatory" Theme

The design concept is **Observatory** — a deep-space, precision-engineering aesthetic that reflects the name "Proxima" (Proxima Centauri, the nearest star). The UI feels like a mission control dashboard: precise, technical, calm, but alive with subtle warmth. Key principles: high contrast for readability, generous spacing for breathing room, restrained animation for professionalism, and color used surgically — never decoratively.

---

### Design Philosophy

1. **Dark-first, but not flat**: backgrounds use layered depth (3 tiers of darkness) to create spatial hierarchy without borders everywhere. Cards "float" above the surface.
2. **Color as signal, not decoration**: the accent color (cyan-teal) appears only where it means something — active states, primary actions, progress, success. Never used as mere ornamentation.
3. **Typography carries the hierarchy**: font weight, size, and family do the heavy lifting. Minimal reliance on color or borders to communicate structure.
4. **Quiet until needed**: no gratuitous animations. Motion is used only for state transitions (modals, accordions, toasts) and progress indicators. Keep it at 200ms cubic-bezier(0.25, 0.1, 0.25, 1).

---

### Color Palette

Define in `src/app/globals.css` using Tailwind v4's `@theme` directive:

```css
@import "tailwindcss";

@theme {
  /* ── Backgrounds (3-tier depth system) ── */
  --color-surface-0: #06090F;        /* Deepest — page background, the "void" */
  --color-surface-1: #0C1119;        /* Mid layer — sidebar, topbar, modal overlays */
  --color-surface-2: #121926;        /* Card/panel surfaces — where content lives */
  --color-surface-3: #1A2235;        /* Elevated — hovered cards, active elements, dropdowns */

  /* ── Borders ── */
  --color-edge: #1C2536;             /* Default border — subtle, almost invisible */
  --color-edge-strong: #2A3650;      /* Emphasized border — hover states, focused inputs */

  /* ── Text (4-tier hierarchy) ── */
  --color-ink-primary: #E4E8F1;      /* Headings, active nav, important labels */
  --color-ink-secondary: #94A0B8;    /* Body text, descriptions, table cells */
  --color-ink-tertiary: #5C6A82;     /* Metadata, timestamps, helper text */
  --color-ink-ghost: #3B4560;        /* Disabled text, empty states, placeholder */

  /* ── Accent (cyan-teal spectrum) ── */
  --color-signal: #22D3B7;           /* Primary accent — buttons, links, progress fills, active indicators */
  --color-signal-hover: #34E8CC;     /* Accent hover — slightly brighter, not a different hue */
  --color-signal-muted: rgba(34, 211, 183, 0.12);  /* Accent background tint — active nav bg, badge bg */
  --color-signal-glow: rgba(34, 211, 183, 0.25);   /* Focus rings, hover shadows */

  /* ── Semantic colors ── */
  --color-success: #34D399;          /* Graded, completed, published */
  --color-warning: #FBBF24;          /* Pending, submitted, low stock */
  --color-danger: #F87171;           /* Errors, overdue, failed */
  --color-info: #60A5FA;             /* In progress, informational */
  --color-purple: #A78BFA;           /* Code-related, tier badges */

  /* ── Semantic tints (for badge/tag backgrounds) ── */
  --color-success-tint: rgba(52, 211, 153, 0.12);
  --color-warning-tint: rgba(251, 191, 36, 0.12);
  --color-danger-tint: rgba(248, 113, 113, 0.12);
  --color-info-tint: rgba(96, 165, 250, 0.12);
  --color-purple-tint: rgba(167, 139, 250, 0.12);

  /* ── Radii ── */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--color-edge);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px var(--color-edge-strong);
  --shadow-glow: 0 0 20px var(--color-signal-glow);
}
```

**Why this palette**: The `surface-0/1/2/3` system replaces blunt bg + border combos with spatial layering. The 3 backgrounds and 4 text tiers create a clear reading hierarchy without needing bold colors everywhere. The single accent hue (cyan-teal `#22D3B7`) avoids the "rainbow dashboard" trap — every tinted element on screen means something.

---

### Typography System

Three font families, each with a strict role. Import via `next/font/google` in `src/app/layout.tsx`:

```tsx
import { Syne, Outfit, JetBrains_Mono } from "next/font/google"

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

// Apply to <html>:
// className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
```

Add to `globals.css` inside `@theme`:
```css
  --font-family-display: var(--font-display), system-ui, sans-serif;
  --font-family-body: var(--font-body), system-ui, sans-serif;
  --font-family-mono: var(--font-mono), ui-monospace, monospace;
```

And base styles:
```css
body {
  font-family: var(--font-family-body);
  background-color: var(--color-surface-0);
  color: var(--color-ink-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### Font Roles

| Font | CSS Variable | Role | Where Used |
|------|-------------|------|------------|
| **Syne** | `--font-display` | Display & headings | Logo wordmark, page titles (h1/h2), stat card values, section headers, nav group labels, badge text, toast titles. Syne has a distinctive geometric character with slightly widened letterforms and sharp angles — it reads as "technical" and "forward-looking" without being cold. |
| **Outfit** | `--font-body` | Body & UI | All paragraph text, form labels, input values, button labels, table cells, descriptions, modal body text, sidebar nav items, tooltips. Outfit is a geometric sans with a tall x-height and open counters — extremely readable at 13-16px on screens. |
| **JetBrains Mono** | `--font-mono` | Code & data | Code editor, code viewer, code skeleton displays, quiz answer grids, grade numbers inside grade circles, hardware spec strings, the `PROXIMA` logo subtitle ("ROBOTICS LMS"), tiny uppercase metadata labels (e.g., "MODULES", "LESSONS"), stat card descriptors. |

#### Type Scale

Use Tailwind's default scale but apply font families deliberately:

| Element | Family | Size | Weight | Tracking | Color |
|---------|--------|------|--------|----------|-------|
| Logo wordmark "PROXIMA" | Syne | 20px | 800 | 6px (`tracking-[6px]`) | Gradient text (signal → signal-hover) |
| Logo subtitle "ROBOTICS LMS" | JetBrains Mono | 9px | 500 | 4px | `ink-tertiary` |
| Page title (h1) | Syne | 24px | 700 | -0.5px (`tracking-tight`) | `ink-primary` |
| Page subtitle | Outfit | 14px | 400 | 0 | `ink-tertiary` |
| Section header (h3) | Syne | 13px | 700 | 2px, uppercase | `ink-tertiary` |
| Card title | Syne | 16px | 600 | -0.3px | `ink-primary` |
| Body text | Outfit | 14px | 400 | 0 | `ink-secondary` |
| Small/meta text | Outfit | 12px | 400 | 0 | `ink-tertiary` |
| Button text | Outfit | 13px | 600 | 0.3px | varies |
| Nav item | Outfit | 13px | 500 | 0 | `ink-secondary` (default), `signal` (active) |
| Badge text | JetBrains Mono | 11px | 500 | 0.5px | semantic color |
| Stat value | Syne | 32px | 800 | -1px | `ink-primary` |
| Stat label | JetBrains Mono | 10px | 500 | 2px, uppercase | `ink-tertiary` |
| Grade number | JetBrains Mono | 16px | 700 | 0 | semantic color |
| Table header | JetBrains Mono | 10px | 500 | 1.5px, uppercase | `ink-ghost` |
| Table cell | Outfit | 13px | 400 | 0 | `ink-secondary` |
| Code block | JetBrains Mono | 13px | 400 | 0 | `#C9D1D9` (GitHub-dark style) |
| Input text | Outfit | 13px | 400 | 0 | `ink-primary` |
| Input placeholder | Outfit | 13px | 400 | 0 | `ink-ghost` |

---

### Sidebar

- Width: **256px** fixed. Collapses to off-screen on mobile (slide-in overlay with backdrop).
- Background: `surface-1`. No visible right border — instead use a 1px `edge` border only if `surface-0` and `surface-1` are too close in value on certain monitors. Prefer shadow: `1px 0 0 var(--color-edge)` (hairline inset shadow).
- **Logo block** (top, 72px tall): The Proxima logo mark is a 36×36px rounded square (`radius-md`) with a `linear-gradient(135deg, var(--color-signal), #0EA5A0)` background. Inside: white bold "P" in Syne 16px. Adjacent: "PROXIMA" in Syne 800, 14px, tracking 4px, gradient text. Below: "ROBOTICS LMS" in JetBrains Mono 9px, tracking 3px, `ink-ghost`.
- **Nav groups**: labeled with JetBrains Mono 10px uppercase, tracking 2px, `ink-ghost`, 20px top margin before each group.
- **Nav items**: Outfit 13px weight-500, `ink-secondary`, 40px tall, `radius-md`, 12px horizontal padding. On hover: `surface-3` background, text lightens to `ink-primary`. **Active state**: `signal-muted` background, `signal` text color, and a 3px-wide `signal` left bar (absolute positioned, 60% height, `radius-full` on right side).
- **Pending badge**: JetBrains Mono 10px weight-700, `signal` bg, `surface-0` text, pill shape, min-width 20px, right-aligned in nav item.
- **User block** (bottom, 64px): bordered top `edge`. User avatar is 36×36 circle with gradient bg (`signal` → `purple`), initials in Outfit 12px bold white. Name in Outfit 13px 600 `ink-primary`, role in Outfit 11px `ink-tertiary` capitalize.

#### Nav Items by Role

```
── MAIN ──────────────────────────
  Dashboard        LayoutDashboard    (all roles)
  Courses          BookOpen           (all roles)
  Tasks            CheckSquare        (all roles)
  Grades           BarChart3          (all roles)
  Calendar         CalendarDays       (all roles)

── RESOURCES ─────────────────────
  Lesson Packages  Package            (all roles)
  Hardware Kits    Wrench             (teacher, admin)

── SYSTEM ────────────────────────  (admin only)
  Users            Users              (admin)
  Settings         Settings           (all roles)
```

Icon size: 18px. Icon color follows text color. Import from `lucide-react`.

---

### Topbar

- Height: **60px**. Background: `surface-1`. Bottom border: `edge`.
- Left: page title in Syne 15px weight-700, tracking 1px, `ink-primary`.
- Center-right: search bar — `surface-2` bg, `edge` border, `radius-md`, 240px wide, Outfit 13px, with a Search icon (16px, `ink-ghost`) left-aligned inside. Focus: `edge-strong` border + `signal-glow` shadow ring.
- Right: notification bell icon button (18px, `ink-secondary`, relative — with a 7px `danger` dot if unread), user avatar (32px circle).
- Mobile: hamburger menu button (20px Menu icon) replaces logo, triggers sidebar slide-in.

---

### Cards

The primary container for all content blocks.

```
Background:    surface-2
Border:        1px solid edge  (achieved via shadow-card which includes the border)
Border radius: radius-lg (14px)
Padding:       20px (p-5)
Shadow:        shadow-card
Hover:         border transitions to edge-strong over 200ms
```

**Card header pattern**: section title in Syne 13px weight-700, tracking 2px, uppercase, `ink-tertiary`. Optional right-side action (button or link). Separated from content by 16px margin-bottom.

Cards do NOT have visible borders on every edge — the `shadow-card` includes a `0 0 0 1px` ring that acts as a subtle border, appearing only because it's slightly lighter than the background beneath. This is intentional: it creates depth without visual noise.

---

### Buttons

Four variants. All use Outfit 13px weight-600, `radius-md`, 200ms transition.

| Variant | Background | Text | Border | Hover | Use |
|---------|-----------|------|--------|-------|-----|
| **Primary** | `signal` | `surface-0` | none | `signal-hover` bg + `shadow-glow` | Primary actions: Submit, Create, Enroll, Grade |
| **Secondary** | `surface-3` | `ink-primary` | 1px `edge` | `edge-strong` border | Secondary actions: Cancel, Back, Edit, Filter |
| **Ghost** | transparent | `ink-secondary` | none | `surface-3` bg, `ink-primary` text | Tertiary: View, navigation links, icon buttons |
| **Danger** | `danger` | white | none | brighter red, subtle red shadow | Destructive: Delete, Remove |

Sizes:
- Default: `px-4 py-2` (height ~38px)
- Small (`btn-sm`): `px-3 py-1.5` (height ~32px), font 12px
- Icon-only: `p-2`, square

---

### Badges

Pill-shaped status indicators. JetBrains Mono 11px weight-500, tracking 0.5px, `radius-full`, `px-2.5 py-0.5`.

| Status | Background | Text |
|--------|-----------|------|
| Completed / Graded / Published / In Stock | `success-tint` | `success` |
| In Progress / Info | `info-tint` | `info` |
| Submitted / Pending / Low Stock | `warning-tint` | `warning` |
| Overdue / Error | `danger-tint` | `danger` |
| Code / Professional tier | `purple-tint` | `purple` |
| Draft / Locked / Neutral | `rgba(94, 106, 130, 0.12)` | `ink-tertiary` |
| Level: Elementary | `success-tint` | `success` |
| Level: HS | `info-tint` | `info` |
| Level: College | `purple-tint` | `purple` |

---

### Stat Cards

Used on dashboard. Card container (`surface-2`, shadow-card, `radius-lg`, p-5).

- **Label**: JetBrains Mono 10px weight-500, tracking 2px, uppercase, `ink-ghost`. Margin-bottom 8px.
- **Value**: Syne 32px weight-800, tracking -1px, `ink-primary`.
- **Subtext**: Outfit 12px weight-400, `ink-tertiary`, margin-top 4px.
- **Progress bar** (if present): below subtext, margin-top 8px.

---

### Progress Bars

- Track: `surface-3`, 6px height, `radius-full`.
- Fill: `linear-gradient(90deg, var(--color-signal), #0EA5A0)`, `radius-full`, width transitions over 600ms ease-out.
- Variant (thick): 8px height, used on course detail pages.

---

### Grade Circles

48×48px circle, `radius-full`, 2px border, centered JetBrains Mono 16px weight-700.

| Range | Background | Border | Text |
|-------|-----------|--------|------|
| 90-100 (A) | `success-tint` | `success` at 30% opacity | `success` |
| 80-89 (B) | `info-tint` | `info` at 30% opacity | `info` |
| 70-79 (C) | `warning-tint` | `warning` at 30% opacity | `warning` |
| 0-69 (F) | `danger-tint` | `danger` at 30% opacity | `danger` |

---

### Tables

- Container: inside a card, padding 0 (card padding is removed, table is full-bleed inside).
- **Header row**: JetBrains Mono 10px weight-500, tracking 1.5px, uppercase, `ink-ghost`, bottom border `edge`, `py-3 px-4`.
- **Body cells**: Outfit 13px weight-400, `ink-secondary`, bottom border `edge` (last row: no border), `py-3 px-4`.
- **Row hover**: `surface-3` background, 150ms transition.
- **Primary column** (first text column): Outfit 13px weight-600, `ink-primary` — makes the "name" column pop.
- Mobile: tables become stacked card lists. Each row renders as a mini-card with label-value pairs.

---

### Forms

- **Labels**: JetBrains Mono 10px weight-500, tracking 1.5px, uppercase, `ink-ghost`. Margin-bottom 6px.
- **Inputs**: `surface-3` bg, `edge` border, `radius-md`, Outfit 13px, `ink-primary` text, `ink-ghost` placeholder. Height 40px (py-2.5 px-3). Focus: `edge-strong` border + `0 0 0 3px signal-muted` ring.
- **Textareas**: same styling, min-height 80px, vertical resize only.
- **Selects**: same as inputs, cursor pointer.
- **Form groups**: 16px margin-bottom between fields.

---

### Module Accordion

- **Module block**: `radius-lg` container, `edge` border, overflow hidden, 12px margin-bottom.
- **Module header** (clickable): `surface-3` bg, Outfit 14px weight-600, `ink-primary`. Left side: module number in a 28×28 `radius-md` box with `signal-muted` bg and `signal` text (JetBrains Mono 12px weight-700). Right side: lesson count in Outfit 12px `ink-tertiary` + chevron icon (rotates 90° when expanded, 200ms transition). Hover: `surface-3` lightens slightly.
- **Lesson items** (inside expanded module): 48px tall, Outfit 13px, left-padded 56px. Each has a 28×28 `radius-md` icon box (color coded: completed=`success-tint`/`success`, in_progress=`info-tint`/`info`, locked=neutral). Right side: type badge + duration with Clock icon. Hover: `surface-3` bg.

---

### Code Blocks (Static Display)

For `<CodeViewer>` components showing submitted code:

```
Background:    #0D1117 (GitHub-dark bg)
Border:        1px solid edge
Border radius: radius-md
Padding:       16px
Font:          JetBrains Mono 13px weight-400
Line height:   1.7
Color:         #C9D1D9
Overflow-x:    auto
White-space:   pre-wrap
```

For the Monaco editor (`<CodeEditor>`): use the `"vs-dark"` theme with the same background override `#0D1117`.

---

### Modals

- **Overlay**: fixed inset-0, `rgba(0, 0, 0, 0.7)`, backdrop-blur 4px, fade-in 150ms.
- **Content**: `surface-1` bg, `edge` border, `radius-lg`, max-width 600px, max-height 85vh, overflow-y auto, slide-up animation 200ms.
- **Header**: px-6 py-5, bottom border `edge`. Title in Syne 14px weight-700, tracking 1px. Close button: Ghost icon button, X icon 18px.
- **Body**: px-6 py-5.
- **Footer**: px-6 py-4, top border `edge`, flex justify-end gap-2.

---

### Toast Notifications

- Fixed bottom-right, 24px from edges.
- `surface-1` bg, `signal` left border (3px wide), `radius-lg`, `shadow-elevated`.
- Content: icon (Check 14px, `signal`) + message in Outfit 13px weight-500 `ink-primary`.
- Auto-dismiss after 3 seconds with fade-out.

---

### Calendar

- **Month grid**: 7-column CSS grid, 2px gap.
- **Day header**: JetBrains Mono 10px weight-500, `ink-ghost`, uppercase, tracking 1px, centered.
- **Day cell**: aspect-ratio 1, `radius-md`, Outfit 13px `ink-secondary`, centered. Hover: `surface-3` bg. Today: `signal-muted` bg, `signal` text, Outfit weight-700. Other-month days: `ink-ghost` at 40% opacity.
- **Event dots**: 5px circle, positioned absolute bottom 4px, color-coded (warning=deadline, danger=exam, signal=event).

---

### Lesson Package Cards

Special treatment for the pricing/subscription section:

- Card with `surface-2` bg, **3px solid top border** colored by tier (Elementary=`success`, HS=`info`, College=`purple`).
- Hover: translateY(-2px), `shadow-elevated`, `edge-strong` border.
- Price: Syne 22px weight-800, colored by tier.
- Stats boxes (Modules/Lessons): `surface-3` bg, `radius-md`, centered, JetBrains Mono 20px weight-700 value + 10px uppercase label.
- Includes checklist: rows with a Check icon colored by tier + Outfit 13px.
- Subscribe button: full-width primary button.

---

### Hardware Kit Cards

- Large emoji (40px), kit name in Syne 16px weight-700, level badge.
- Spec string in JetBrains Mono 12px weight-400 `ink-tertiary`.
- Three stat boxes in a row: Total / Assigned / Available — each in `surface-3` bg, JetBrains Mono 18px weight-700 centered, 10px label below.
- Assignment progress bar below stats.

---

### Login Page

- Full viewport, `surface-0` bg. Centered single card. No sidebar.
- Logo: 64×64 rounded-2xl, gradient bg, "P" in Syne 24px weight-800 white.
- "PROXIMA": Syne 24px weight-800, tracking 6px, gradient text via `bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-signal)] to-[#0EA5A0]`.
- "ROBOTICS LMS": JetBrains Mono 10px weight-500, tracking 4px, `ink-ghost`.
- Card (`surface-2`, `edge` border, `radius-lg`, p-8) below logo with 32px gap.
- Role selector (login page — for demo convenience): 3-column grid of role buttons. Each: `surface-3` bg, `edge` border, `radius-md`, Outfit 12px weight-600. Active: `signal-muted` bg, `signal` text, `signal` border.
- Form fields + primary full-width submit button.
- Demo hint at bottom: Outfit 11px `ink-ghost`.

---

### Responsive Breakpoints

- **≥1024px (lg)**: Full sidebar + content. Stats grid 4 columns. Course grid 3 columns.
- **768-1023px (md)**: Sidebar hidden (hamburger toggle). Stats grid 2 columns. Course grid 2 columns.
- **<768px (sm)**: Everything single-column. Tables become card stacks. Topbar search hidden (separate search page or expandable). Modal goes full-width with 16px margin.

---

### Animation Specifications

Keep it minimal. Only these animations exist:

```css
/* Fade in — for page content on mount */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up — for modals, toasts, cards loading in */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* No spring/bounce physics. No parallax. No scroll-triggered animations.
   The app should feel calm and precise, not playful. */
```

- Page content: `animation: fadeIn 0.25s ease`
- Modals: `animation: slideUp 0.2s ease`
- Toasts: `animation: slideUp 0.3s ease`
- Accordion expand: max-height transition 200ms ease
- Sidebar active bar: width transition 150ms ease
- Hover states: 150ms transition
- Focus rings: instant (no transition on box-shadow for focus — it should feel immediate)

---

### Scrollbar Styling

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-edge); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-edge-strong); }
```

---

### Icon System

All icons from `lucide-react`. Default size 18px for nav, 16px for inline, 14px for badges/small elements. Stroke-width 1.75 (the default). Color always follows adjacent text color — icons never have independent colors except in status contexts (where they follow the semantic color of their badge/state).

---

## Environment Variables

File: `.env.example`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/proxima_lms"
AUTH_SECRET="run: npx auth secret"
AUTH_URL="http://localhost:3000"
UPLOADTHING_TOKEN=""
```

Only `DATABASE_URL` and `AUTH_SECRET` required. Uploadthing only for video uploads.

---

## Build & Run

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
# Open http://localhost:3000 → elena@proxima.edu / password123
```

---

## Implementation Order

Each step must compile and work before the next:

1. **Init + Prisma + seed** — create-next-app, schema, migrate, seed, verify via Prisma Studio
2. **Auth** — auth.ts, middleware, login/register pages, API route, type augmentation
3. **Dashboard layout** — sidebar, topbar, mobile nav. Role-based nav items
4. **Dashboard page** — stats, announcements, activity, events (all server-fetched)
5. **Courses** — list, detail, create, module accordion, lesson items
6. **Lesson viewer** — slides (react-markdown), code (Monaco), quiz, task submission
7. **Tasks + grading** — task list, detail, grading form
8. **Grades** — summaries, table, distribution chart
9. **Calendar** — month grid, event list, create event
10. **Packages + Hardware** — cards, inventory, kit assignment
11. **Admin users** — user table, role editing
12. **Settings** — profile, password change
13. **Polish** — loading.tsx skeletons, error.tsx boundaries, toasts, responsive
