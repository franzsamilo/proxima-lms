## 2. Auth & Session
**What it should do:** JWT-based credentials auth via Auth.js v5 with role-aware middleware redirects and registration via bcrypt hashing.

### 🔴 BLOCKER: Middleware implementation pattern mismatch
- **Feature:** Auth & Session
- **Location:** src/middleware.ts:1-35
- **Roles affected:** ALL
- **Expected (per CLAUDE.md):** `export default auth((req) => { ... })` - wraps middleware function with NextAuth's auth() HOF for automatic token/session injection
- **Actual:** `async function middleware(req: NextRequest) { ... }` with manual `getToken()` call
- **Repro:** In src/middleware.ts, the middleware is NOT wrapped with the `auth()` function from src/lib/auth.ts. Spec shows auth.js v5 pattern of exporting middleware wrapped with `auth()`, but code manually calls `getToken()` instead.
- **Notes:** This deviates from Auth.js v5 recommended pattern. The current approach still works (manual getToken is valid), but it's not the spec-prescribed pattern. In Auth.js v5, the `auth()` HOF provides better type safety and automatic token refresh handling. Consider refactoring to: `import { auth } from "@/lib/auth"; export default auth((req) => { const isLoggedIn = !!req.auth; ... })`. This would eliminate the need for manual getToken and secret handling.

### 🟡 BUG: SchoolLevel enum mismatch between register page and schema
- **Feature:** Auth & Session (Registration)
- **Location:** src/app/(auth)/register/page.tsx:12, src/lib/validations.ts:14
- **Roles affected:** STUDENT
- **Expected (per schema):** registerSchema defines schoolLevel enum as ["ELEMENTARY", "HS", "COLLEGE"]
- **Actual:** RegisterPage component defines SchoolLevel type as "ELEMENTARY" | "HIGH_SCHOOL" | "COLLEGE" and renders option values as "HIGH_SCHOOL" instead of "HS"
- **Repro:** Register as STUDENT, select "High School" level, form will submit "HIGH_SCHOOL" to /api/auth/register but validation schema expects "HS". Zod validation will fail with status 400.
- **Notes:** This is a breaking bug for student registration. Fix: update registerPage.tsx line 12 to use "HS" instead of "HIGH_SCHOOL" in type and options, or update validations.ts line 14 to accept "HIGH_SCHOOL".

### 🟡 BUG: Register API error response format mismatch
- **Feature:** Auth & Session (Registration)
- **Location:** src/app/api/auth/register/route.ts:11, 16; src/app/(auth)/register/page.tsx:66-69
- **Roles affected:** ALL (on registration error)
- **Expected (per spec):** Both validation errors and duplicate email should use consistent response format
- **Actual:** Line 11 returns `{ error: parsed.error.flatten().fieldErrors }` (error key with fieldErrors object), line 16 returns `{ error: "Email already registered" }` (error key with string). Client code checks for `data.errors` (plural) at line 66.
- **Repro:** (1) Submit form with validation error → receives `{ error: {...} }` but client checks `data.errors` (undefined). (2) Email duplicate → receives `{ error: "string" }`, client tries `data.errors` (undefined), falls through to `data.message` which doesn't exist. Both cases will show generic "Registration failed" instead of specific errors.
- **Notes:** Client expects `{ errors: ... }` (plural) but API returns `{ error: ... }` (singular). Fix: change API responses to use `errors` key, or update client error handling to check `data.error` instead of `data.errors`.

### 🟡 BUG: Middleware matcher includes icon.svg instead of logo.svg
- **Feature:** Auth & Session
- **Location:** src/middleware.ts:34
- **Roles affected:** ALL (minor)
- **Expected (per CLAUDE.md spec):** matcher should exclude "logo.svg" (the actual asset referenced in the spec)
- **Actual:** matcher excludes "icon.svg" but per CLAUDE.md file structure, the asset is "logo.svg"
- **Repro:** Request to /public/logo.svg will trigger middleware check; /public/icon.svg will be skipped. This is a minor asset routing issue.
- **Notes:** Inconsistency between spec and implementation. Unclear if icon.svg exists in public dir. Either update matcher to exclude "logo.svg" per spec, or clarify the actual asset filename.

### ⚪ NOTE: PrismaAdapter cast-to-any
- **Feature:** Auth & Session
- **Location:** src/lib/auth.ts:8
- **Roles affected:** ALL
- **Expected (per spec):** PrismaAdapter should be properly typed
- **Actual:** `adapter: PrismaAdapter(prisma) as any` - uses `as any` type assertion
- **Notes:** Runtime-functional but masks potential type mismatches. Low risk in practice. Consider removing `as any` if @auth/prisma-adapter types are compatible with setup.

### ⚪ NOTE: Next.js 16 searchParams not awaited in login page
- **Feature:** Auth & Session (Login)
- **Location:** src/app/(auth)/login/page.tsx:20
- **Roles affected:** ALL
- **Expected (per Next.js 16 spec):** searchParams is a Promise in Next.js 16 and must be awaited
- **Actual:** `const searchParams = useSearchParams()` - uses hook directly (client component context)
- **Repro:** Runtime test required. In this case, `useSearchParams()` is client-side hook, so no await needed. Code is correct.
- **Notes:** This is actually correct for client components. No fix needed.

---

**Coverage:** code-audited src/lib/auth.ts, src/lib/auth-helpers.ts, src/middleware.ts, src/app/api/auth/[...nextauth]/route.ts, src/app/api/auth/register/route.ts, src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx, src/types/next-auth.d.ts, src/lib/validations.ts; runtime checks deferred (code-only fallback).
