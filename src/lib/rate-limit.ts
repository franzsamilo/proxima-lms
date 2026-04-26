/**
 * In-memory sliding-window rate limiter.
 *
 * Per-instance only — works for single-server deploys (Render, Railway, Fly,
 * a single Vercel region with low fan-out). For high-fanout serverless or
 * multi-region prod, swap the in-memory Map for Upstash Redis or Vercel KV.
 *
 * Usage:
 *   const r = rateLimit("login:" + ip, { limit: 5, windowMs: 60_000 })
 *   if (!r.ok) return error(`Too many attempts. Try again in ${r.retryAfterSec}s.`)
 */

interface Bucket {
  hits: number[]
}

interface RateLimitOptions {
  /** Maximum hits permitted within the window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSec: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Periodic cleanup so the Map doesn't grow forever for one-off IPs.
// Runs at most every 5 min on access — no setInterval needed (works in edge too).
let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 5 * 60_000

function maybeSweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets.entries()) {
    const cutoff = now - windowMs
    if (!bucket.hits.some((t) => t > cutoff)) {
      buckets.delete(key)
    }
  }
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const cutoff = now - opts.windowMs

  maybeSweep(now, opts.windowMs)

  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((t) => t > cutoff)

  const remaining = Math.max(0, opts.limit - bucket.hits.length - 1)
  const oldest = bucket.hits[0]
  const resetAt = oldest ? oldest + opts.windowMs : now + opts.windowMs
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - now) / 1000))

  if (bucket.hits.length >= opts.limit) {
    buckets.set(key, bucket)
    return { ok: false, remaining: 0, retryAfterSec, resetAt }
  }

  bucket.hits.push(now)
  buckets.set(key, bucket)
  return { ok: true, remaining, retryAfterSec: 0, resetAt }
}

/**
 * Best-effort client IP extraction from request headers.
 * Reads x-forwarded-for (first hop), then x-real-ip, then falls back to a
 * literal "unknown" so unidentified callers still get a shared bucket.
 */
export function ipFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for")
  if (fwd) {
    const first = fwd.split(",")[0]?.trim()
    if (first) return first
  }
  const real = headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}
