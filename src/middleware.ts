import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/courses",
  "/lessons",
  "/tasks",
  "/grades",
  "/calendar",
  "/packages",
  "/hardware",
  "/users",
  "/settings",
]

// Cover all session cookie names Auth.js (v4 + v5) may have set across deploys.
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
]

const STALE_AUTH_COOKIES = [
  ...SESSION_COOKIE_NAMES,
  "authjs.csrf-token",
  "__Host-authjs.csrf-token",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "authjs.pkce.code_verifier",
  "__Secure-authjs.pkce.code_verifier",
]

function clearAuthCookies(res: NextResponse) {
  for (const name of STALE_AUTH_COOKIES) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" })
  }
}

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const path = req.nextUrl.pathname
  const isAuthPage = path === "/login" || path === "/register"
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  )

  const hasSessionCookie = SESSION_COOKIE_NAMES.some((n) => req.cookies.has(n))

  // ── Self-healing: stale/corrupted session cookie ──────────────────
  // If a session cookie is present but Auth.js could not decode it into a
  // valid user (key rotation, format drift, paused DB during issuance,
  // expired JWT, etc.), nuke every known auth cookie so the next request
  // is a clean slate. Without this, a bad cookie traps the user in a
  // 307 → /login → 307 loop forever.
  if (!isLoggedIn && hasSessionCookie) {
    if (isAuthPage) {
      // Already on /login or /register — let them sign in fresh, but clear
      // the bad cookies on the response so the next nav is healthy.
      const res = NextResponse.next()
      res.headers.set("x-pathname", path)
      clearAuthCookies(res)
      return res
    }
    const url = new URL("/login", req.url)
    if (isProtected && path !== "/") url.searchParams.set("from", path)
    url.searchParams.set("reason", "session_expired")
    const res = NextResponse.redirect(url)
    clearAuthCookies(res)
    return res
  }

  // ── Standard guards ────────────────────────────────────────────────
  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.url)
    if (path !== "/") url.searchParams.set("from", path)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  const res = NextResponse.next()
  res.headers.set("x-pathname", path)
  return res
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)",
  ],
}
