import type { NextRequest } from "next/server"
import { handlers } from "@/lib/auth"
import { rateLimit, ipFromHeaders } from "@/lib/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export const GET = handlers.GET

const CREDENTIALS_LIMIT = { limit: 8, windowMs: 60_000 } // 8 attempts/min/IP

/**
 * Wraps Auth.js's POST handler to rate-limit credential callbacks at the
 * route level. The login server action also enforces this, but this catches
 * direct POSTs that bypass the action.
 */
export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (path.endsWith("/callback/credentials")) {
    const ip = ipFromHeaders(req.headers)
    const r = rateLimit(`auth-callback:${ip}`, CREDENTIALS_LIMIT)
    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: "Too many sign-in attempts. Slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(r.retryAfterSec),
          },
        }
      )
    }
  }

  return handlers.POST(req)
}
