import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { getDb } from "./db"

const authConfig: NextAuthConfig = {
  adapter: process.env.DATABASE_URL ? PrismaAdapter(getDb()) : undefined,
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
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
