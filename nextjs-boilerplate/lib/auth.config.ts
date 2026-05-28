import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

const authConfig = {
  providers:
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }

      return token
    },
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? ""
        session.user.role = user?.role ?? token.role ?? "USER"
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig

export default authConfig
