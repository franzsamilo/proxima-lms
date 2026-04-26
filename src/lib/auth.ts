import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"

// ── Startup guard ──────────────────────────────────────────────
// Auth.js v5 silently signs JWTs with a derived key if AUTH_SECRET is unset
// in dev, but FAILS in production. Surface that loudly so it's caught at
// boot, not at the first failed login.
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  const message =
    "AUTH_SECRET is missing or too short (need ≥32 chars). Generate with `npx auth secret` and set it in your environment."
  if (process.env.NODE_ENV === "production") {
    throw new Error(message)
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[auth] ${message}`)
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: user.role,
        }
      },
    }),
  ],
})
