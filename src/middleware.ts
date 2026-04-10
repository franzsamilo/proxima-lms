import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value
  const isLoggedIn = !!token
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
  const res = NextResponse.next()
  res.headers.set("x-pathname", path)
  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
}
