import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Always allow — gating + stale cookie cleanup happens in middleware.ts
    // so it can mutate Set-Cookie headers on the response.
    authorized: () => true,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") session.user.id = token.id
        if (token.role) session.user.role = token.role as typeof session.user.role
      }
      return session
    },
  },
  providers: [],
}
