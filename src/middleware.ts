import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
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

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
}
