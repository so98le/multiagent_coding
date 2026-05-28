import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import { getDb } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: process.env.DATABASE_URL ? PrismaAdapter(getDb()) : undefined,
  session: {
    strategy: "jwt",
  },
})
