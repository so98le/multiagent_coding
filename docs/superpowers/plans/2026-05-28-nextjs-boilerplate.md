# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a minimal Next.js boilerplate with App Router, Tailwind CSS, shadcn/ui, Auth.js v5 (Google OAuth), and Prisma + PostgreSQL as a subdirectory `nextjs-boilerplate/` inside the current repo.

**Architecture:** Route groups separate authenticated `(dashboard)` and unauthenticated `(auth)` pages. `middleware.ts` guards all routes except `/login` and Next.js internals. Auth.js v5 with `PrismaAdapter` stores sessions and users in PostgreSQL. No client-side session provider needed — all auth checks happen in Server Components.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, next-auth@5, @auth/prisma-adapter, Prisma, PostgreSQL, Vitest

---

## File Map

**Created by tooling (do not edit manually):**
- `nextjs-boilerplate/` — scaffolded by `create-next-app`
- `nextjs-boilerplate/lib/utils.ts` — created by `shadcn init` (provides `cn()`)
- `nextjs-boilerplate/components/ui/button.tsx` — created by `shadcn add`
- `nextjs-boilerplate/components/ui/card.tsx` — created by `shadcn add`

**Created manually:**
- `nextjs-boilerplate/vitest.config.ts` — Vitest config with `@/*` alias
- `nextjs-boilerplate/__tests__/lib/utils.test.ts` — unit tests for `cn()`
- `nextjs-boilerplate/prisma/schema.prisma` — Auth.js required models: User, Account, Session, VerificationToken
- `nextjs-boilerplate/lib/db.ts` — Prisma client singleton (prevents hot-reload duplicates)
- `nextjs-boilerplate/lib/auth.ts` — Auth.js config; exports `auth`, `signIn`, `signOut`, `handlers`
- `nextjs-boilerplate/app/api/auth/[...nextauth]/route.ts` — forwards GET/POST to Auth.js handlers
- `nextjs-boilerplate/middleware.ts` — redirects unauthenticated requests to `/login`
- `nextjs-boilerplate/.env.example` — committed template with all required keys
- `nextjs-boilerplate/.env.local` — actual secrets; gitignored, never committed
- `nextjs-boilerplate/app/(auth)/layout.tsx` — pass-through layout for unauthenticated pages
- `nextjs-boilerplate/app/(auth)/login/page.tsx` — Google sign-in button via Server Action
- `nextjs-boilerplate/app/(dashboard)/layout.tsx` — server-side auth guard; redirects to `/login` if no session
- `nextjs-boilerplate/app/(dashboard)/dashboard/page.tsx` — post-login landing, shows user name

**Modified:**
- `nextjs-boilerplate/app/layout.tsx` — update metadata title/description and `lang`
- `nextjs-boilerplate/app/page.tsx` — replace create-next-app default with redirect to `/dashboard`
- `nextjs-boilerplate/package.json` — add `test` script and `db:*` Prisma scripts

---

### Task 1: Scaffold Next.js project

**Working directory:** `D:\vs_code_workspace\multiagent_coding`

**Files:**
- Create: `nextjs-boilerplate/` (entire project directory)
- Modify: `nextjs-boilerplate/app/page.tsx` (temporary placeholder)

- [ ] **Step 1: Run create-next-app**

```bash
npx create-next-app@latest nextjs-boilerplate --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

If prompted interactively, choose: TypeScript → Yes, ESLint → Yes, Tailwind → Yes, `src/` dir → No, App Router → Yes, import alias → `@/*`.

Expected: `nextjs-boilerplate/` directory created with `package.json`, `app/`, `tailwind.config.ts`, `tsconfig.json`.

- [ ] **Step 2: Verify the dev server starts**

```bash
cd nextjs-boilerplate && npm run dev &
```

Open `http://localhost:3000` and confirm the default Next.js page loads. Stop the server (`Ctrl+C`).

- [ ] **Step 3: Replace default page with placeholder**

Replace the full contents of `nextjs-boilerplate/app/page.tsx`:

```tsx
export default function Home() {
  return null
}
```

- [ ] **Step 4: Commit**

```bash
git add nextjs-boilerplate/
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Set up shadcn/ui and Vitest

**Working directory:** `nextjs-boilerplate/`

**Files:**
- Create: `nextjs-boilerplate/components.json` (by shadcn init)
- Create: `nextjs-boilerplate/lib/utils.ts` (by shadcn init)
- Create: `nextjs-boilerplate/components/ui/button.tsx` (by shadcn add)
- Create: `nextjs-boilerplate/components/ui/card.tsx` (by shadcn add)
- Create: `nextjs-boilerplate/vitest.config.ts`
- Create: `nextjs-boilerplate/__tests__/lib/utils.test.ts`
- Modify: `nextjs-boilerplate/package.json` (add `test` script)

- [ ] **Step 1: Initialize shadcn/ui with defaults**

```bash
npx shadcn@latest init -d
```

If `-d` is not supported, run interactively: Style → Default, Base color → Slate, CSS variables → Yes.

Expected: `components.json` created, `lib/utils.ts` created with `cn()`, `app/globals.css` updated with CSS variable definitions.

- [ ] **Step 2: Add button and card components**

```bash
npx shadcn@latest add button card
```

Expected: `components/ui/button.tsx` and `components/ui/card.tsx` created.

- [ ] **Step 3: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 4: Write vitest.config.ts**

Create `nextjs-boilerplate/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

- [ ] **Step 5: Add test script to package.json**

In `nextjs-boilerplate/package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 6: Write failing test for cn()**

Create `nextjs-boilerplate/__tests__/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })
  it('ignores falsy conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })
  it('resolves tailwind conflicts — last class wins', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})
```

- [ ] **Step 7: Run test — expect PASS**

```bash
npm test
```

Expected output:

```
✓ __tests__/lib/utils.test.ts (3)
  ✓ cn > merges class names
  ✓ cn > ignores falsy conditional classes
  ✓ cn > resolves tailwind conflicts — last class wins

Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui and vitest"
```

---

### Task 3: Configure Prisma schema and database client

**Working directory:** `nextjs-boilerplate/`

**Files:**
- Create: `nextjs-boilerplate/prisma/schema.prisma`
- Create: `nextjs-boilerplate/lib/db.ts`
- Modify: `nextjs-boilerplate/package.json` (add `db:*` scripts)

- [ ] **Step 1: Install Prisma**

```bash
npm install -D prisma
npm install @prisma/client
```

- [ ] **Step 2: Write prisma/schema.prisma**

Create `nextjs-boilerplate/prisma/schema.prisma` with the four Auth.js required models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @id
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

- [ ] **Step 3: Generate Prisma client types**

```bash
npx prisma generate
```

Expected:

```
✔ Generated Prisma Client (v5.x.x | library) to ./node_modules/@prisma/client
```

Note: This only generates TypeScript types. Running actual migrations (`npm run db:migrate`) requires a live PostgreSQL connection and `DATABASE_URL` set in `.env.local`.

- [ ] **Step 4: Write lib/db.ts**

Create `nextjs-boilerplate/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

- [ ] **Step 5: Add db scripts to package.json**

In `nextjs-boilerplate/package.json`, add to `"scripts"`:

```json
"db:generate": "prisma generate",
"db:migrate": "prisma migrate dev --env-file .env.local",
"db:push": "prisma db push --env-file .env.local",
"db:studio": "prisma studio --env-file .env.local"
```

- [ ] **Step 6: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add prisma/ lib/db.ts package.json
git commit -m "feat: add prisma schema and db client"
```

---

### Task 4: Configure Auth.js v5, middleware, and environment template

**Working directory:** `nextjs-boilerplate/`

**Files:**
- Create: `nextjs-boilerplate/lib/auth.ts`
- Create: `nextjs-boilerplate/app/api/auth/[...nextauth]/route.ts`
- Create: `nextjs-boilerplate/middleware.ts`
- Create: `nextjs-boilerplate/.env.example`
- Create: `nextjs-boilerplate/.env.local` (gitignored)

- [ ] **Step 1: Install Auth.js v5 and Prisma adapter**

```bash
npm install next-auth@5 @auth/prisma-adapter
```

- [ ] **Step 2: Write lib/auth.ts**

Create `nextjs-boilerplate/lib/auth.ts`:

```typescript
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  pages: {
    signIn: "/login",
  },
})
```

- [ ] **Step 3: Write API route handler**

Create directory `nextjs-boilerplate/app/api/auth/[...nextauth]/` and write `route.ts`:

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 4: Write middleware.ts**

Create `nextjs-boilerplate/middleware.ts` at the project root (same level as `app/`):

```typescript
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 5: Write .env.example**

Create `nextjs-boilerplate/.env.example`:

```
# Auth.js secret — generate with: npx auth secret
AUTH_SECRET=

# Google OAuth credentials — create at https://console.cloud.google.com/
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=
```

- [ ] **Step 6: Create .env.local from template**

```bash
cp .env.example .env.local
```

Verify `.env.local` appears in `.gitignore` (create-next-app includes it by default). Do not fill in values yet — this file is for local development and must never be committed.

- [ ] **Step 7: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts "app/api/auth/[...nextauth]/route.ts" middleware.ts .env.example package.json
git commit -m "feat: add auth.js v5 with google provider and route protection"
```

---

### Task 5: Build login page

**Working directory:** `nextjs-boilerplate/`

**Files:**
- Create: `nextjs-boilerplate/app/(auth)/layout.tsx`
- Create: `nextjs-boilerplate/app/(auth)/login/page.tsx`

- [ ] **Step 1: Write (auth) route group layout**

Create `nextjs-boilerplate/app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

- [ ] **Step 2: Write login page**

Create `nextjs-boilerplate/app/(auth)/login/page.tsx`:

```typescript
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Google로 계속하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(auth)/"
git commit -m "feat: add google login page"
```

---

### Task 6: Build dashboard page

**Working directory:** `nextjs-boilerplate/`

**Files:**
- Create: `nextjs-boilerplate/app/(dashboard)/layout.tsx`
- Create: `nextjs-boilerplate/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Write (dashboard) route group layout with auth guard**

Create `nextjs-boilerplate/app/(dashboard)/layout.tsx`:

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }
  return <>{children}</>
}
```

- [ ] **Step 2: Write dashboard page**

Create `nextjs-boilerplate/app/(dashboard)/dashboard/page.tsx`:

```typescript
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <p className="mt-2 text-muted-foreground">
        {session?.user?.name}님 환영합니다.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/"
git commit -m "feat: add dashboard page with server-side auth guard"
```

---

### Task 7: Update root layout and landing page — final verification

**Working directory:** `nextjs-boilerplate/`

**Files:**
- Modify: `nextjs-boilerplate/app/layout.tsx`
- Modify: `nextjs-boilerplate/app/page.tsx`

- [ ] **Step 1: Update root layout**

Replace the full contents of `nextjs-boilerplate/app/layout.tsx`:

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Next.js + Tailwind + shadcn/ui + Auth.js v5 + Prisma",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update landing page to redirect**

Replace the full contents of `nextjs-boilerplate/app/page.tsx`:

```typescript
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/dashboard")
}
```

Flow: `/` → middleware checks auth → if logged in, passes through → `Home()` immediately calls `redirect("/dashboard")`. If not logged in, middleware redirects to `/login` before `Home()` is ever called.

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: All 3 `cn()` tests pass.

- [ ] **Step 5: Run production build**

```bash
npm run build
```

Expected: Build completes without errors. Routes should include:

```
○ /             (static)
○ /login        (static)
○ /dashboard    (dynamic)
λ /api/auth/[...nextauth]  (dynamic)
```

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: finalize root layout and landing redirect"
```

---

## Setup Instructions (for new developers)

After cloning the repo and `cd nextjs-boilerplate`:

1. **Install dependencies:** `npm install`
2. **Copy env template:** `cp .env.example .env.local`
3. **Generate AUTH_SECRET:** `npx auth secret` — copy the output into `.env.local`
4. **Create Google OAuth app:** Go to [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 credentials, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI. Copy Client ID and Secret into `.env.local`
5. **Set DATABASE_URL** in `.env.local` with your PostgreSQL connection string
6. **Generate Prisma client:** `npm run db:generate`
7. **Run migrations:** `npm run db:migrate`
8. **Start dev server:** `npm run dev`

Open `http://localhost:3000` — you'll be redirected to `/login`, click "Google로 계속하기".
