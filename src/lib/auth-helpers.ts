import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden")
    this.name = "ForbiddenError"
  }
}

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.user.findUnique({ where: { id: session.user.id } })
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new UnauthorizedError()
  return session.user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role as Role)) throw new ForbiddenError()
  return user
}

/**
 * Wraps a server action so auth/permission errors return as { error } instead
 * of bubbling to the React error boundary. Other errors propagate.
 */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: "UNAUTHORIZED" | "FORBIDDEN" | "INVALID" | "INTERNAL" }

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { ok: true, data }
  } catch (err) {
    if (err instanceof UnauthorizedError) return { ok: false, error: "Sign in required", code: "UNAUTHORIZED" }
    if (err instanceof ForbiddenError) return { ok: false, error: "Permission denied", code: "FORBIDDEN" }
    if (err instanceof Error) {
      console.error("[safeAction]", err)
      return { ok: false, error: err.message, code: "INTERNAL" }
    }
    return { ok: false, error: "Unknown error", code: "INTERNAL" }
  }
}
