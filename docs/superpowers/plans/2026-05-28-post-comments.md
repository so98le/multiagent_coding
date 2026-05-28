# Post Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a post detail page with one-level comments, authenticated comment creation, and author/admin comment deletion in `nextjs-boilerplate/`.

**Architecture:** Keep the feature server-first. Prisma models define `Post`, `Comment`, and `User.role`; server-side helpers handle validation and authorization; App Router pages and server actions render the detail page and mutate comments. Tests focus on domain logic and permissions so the feature can be verified without adding heavy browser test tooling.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, Auth.js v5, PostgreSQL, Vitest, shadcn/ui

---

## File Map

**Create:**
- `nextjs-boilerplate/app/posts/[postId]/actions.ts` - server actions for comment create and delete
- `nextjs-boilerplate/app/posts/[postId]/page.tsx` - post detail page with comment UI
- `nextjs-boilerplate/components/posts/comment-form.tsx` - authenticated comment form and submit button wrapper
- `nextjs-boilerplate/components/posts/comment-list.tsx` - comment list, empty state, delete buttons
- `nextjs-boilerplate/lib/comments.ts` - comment validation and permission helpers
- `nextjs-boilerplate/lib/posts.ts` - post detail query helpers
- `nextjs-boilerplate/lib/session.ts` - current-user helpers for actions and page rendering
- `nextjs-boilerplate/next-auth.d.ts` - session/user type augmentation for `role`
- `nextjs-boilerplate/__tests__/lib/comments.test.ts` - validation and deletion permission tests
- `nextjs-boilerplate/__tests__/lib/posts.test.ts` - comment sort/filter tests for post detail shaping

**Modify:**
- `nextjs-boilerplate/prisma/schema.prisma` - add `UserRole`, extend `User`, add `Post` and `Comment`
- `nextjs-boilerplate/lib/auth.ts` - add `session` callback to expose `user.id` and `user.role`
- `nextjs-boilerplate/package.json` - add any test command changes only if needed
- `nextjs-boilerplate/README.md` - add short local verification notes if implementation introduces required setup steps

---

### Task 1: Add Prisma models for posts, comments, and roles

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Modify: `nextjs-boilerplate/prisma/schema.prisma`

- [ ] **Step 1: Write the failing schema diff**

Replace `nextjs-boilerplate/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  posts         Post[]
  comments      Comment[]
}

model Post {
  id        String    @id @default(cuid())
  title     String
  content   String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  authorId  String

  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
}

model Comment {
  id        String     @id @default(cuid())
  content   String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  deletedAt DateTime?
  postId    String
  authorId  String

  post      Post       @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User       @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([postId, createdAt])
  @@index([authorId])
  @@index([deletedAt])
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

- [ ] **Step 2: Run Prisma validation**

Run:

```bash
npx prisma validate --schema prisma/schema.prisma
```

Expected output:

```text
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid
```

- [ ] **Step 3: Push the schema to the local database**

Run:

```bash
npm run db:push
```

Expected output:

```text
... Prisma schema loaded ...
... Your database is now in sync with your Prisma schema ...
... Generated Prisma Client ...
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add post and comment prisma models"
```

---

### Task 2: Expose role-aware session data

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/next-auth.d.ts`
- Modify: `nextjs-boilerplate/lib/auth.ts`

- [ ] **Step 1: Write the type augmentation**

Create `nextjs-boilerplate/next-auth.d.ts`:

```ts
import { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
}
```

- [ ] **Step 2: Add session callback in auth config**

Replace `nextjs-boilerplate/lib/auth.ts` with:

```ts
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { getDb } from "./db"

const authConfig: NextAuthConfig = {
  adapter: process.env.DATABASE_URL ? PrismaAdapter(getDb()) : undefined,
  providers:
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role
      }

      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
```

- [ ] **Step 3: Run lint for the auth files**

Run:

```bash
npx eslint lib/auth.ts next-auth.d.ts
```

Expected output:

```text
```

No output means the files pass lint.

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts next-auth.d.ts
git commit -m "feat: expose user role in auth session"
```

---

### Task 3: Add test-covered comment validation and permission helpers

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/lib/comments.ts`
- Create: `nextjs-boilerplate/__tests__/lib/comments.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `nextjs-boilerplate/__tests__/lib/comments.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { canDeleteComment, validateCommentContent, COMMENT_MAX_LENGTH } from "@/lib/comments"

describe("validateCommentContent", () => {
  it("rejects an empty comment", () => {
    expect(() => validateCommentContent("   ")).toThrow("Comment cannot be empty.")
  })

  it("rejects an oversized comment", () => {
    expect(() => validateCommentContent("a".repeat(COMMENT_MAX_LENGTH + 1))).toThrow(
      `Comment must be ${COMMENT_MAX_LENGTH} characters or less.`
    )
  })

  it("returns trimmed content for a valid comment", () => {
    expect(validateCommentContent("  hello world  ")).toBe("hello world")
  })
})

describe("canDeleteComment", () => {
  it("allows the author to delete their comment", () => {
    expect(
      canDeleteComment({
        actorId: "user-1",
        actorRole: "USER",
        commentAuthorId: "user-1",
      })
    ).toBe(true)
  })

  it("allows admins to delete any comment", () => {
    expect(
      canDeleteComment({
        actorId: "admin-1",
        actorRole: "ADMIN",
        commentAuthorId: "user-1",
      })
    ).toBe(true)
  })

  it("rejects other users", () => {
    expect(
      canDeleteComment({
        actorId: "user-2",
        actorRole: "USER",
        commentAuthorId: "user-1",
      })
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npm test -- __tests__/lib/comments.test.ts
```

Expected output:

```text
FAIL  __tests__/lib/comments.test.ts
Error: Failed to resolve import "@/lib/comments"
```

- [ ] **Step 3: Implement the helper module**

Create `nextjs-boilerplate/lib/comments.ts`:

```ts
import type { UserRole } from "@prisma/client"

export const COMMENT_MAX_LENGTH = 1000

type DeletePermissionInput = {
  actorId: string
  actorRole: UserRole
  commentAuthorId: string
}

export function validateCommentContent(content: string) {
  const trimmed = content.trim()

  if (!trimmed) {
    throw new Error("Comment cannot be empty.")
  }

  if (trimmed.length > COMMENT_MAX_LENGTH) {
    throw new Error(`Comment must be ${COMMENT_MAX_LENGTH} characters or less.`)
  }

  return trimmed
}

export function canDeleteComment(input: DeletePermissionInput) {
  return input.actorId === input.commentAuthorId || input.actorRole === "ADMIN"
}
```

- [ ] **Step 4: Run the helper tests and verify they pass**

Run:

```bash
npm test -- __tests__/lib/comments.test.ts
```

Expected output:

```text
... __tests__/lib/comments.test.ts ...
... 6 passed ...
```

- [ ] **Step 5: Commit**

```bash
git add lib/comments.ts __tests__/lib/comments.test.ts
git commit -m "feat: add comment validation helpers"
```

---

### Task 4: Add post detail query shaping with comment filtering and sorting

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/lib/posts.ts`
- Create: `nextjs-boilerplate/__tests__/lib/posts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `nextjs-boilerplate/__tests__/lib/posts.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { shapeVisibleComments } from "@/lib/posts"

describe("shapeVisibleComments", () => {
  it("removes soft-deleted comments", () => {
    const comments = [
      {
        id: "comment-1",
        content: "visible",
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        deletedAt: null,
      },
      {
        id: "comment-2",
        content: "hidden",
        createdAt: new Date("2026-05-28T11:00:00.000Z"),
        deletedAt: new Date("2026-05-28T12:00:00.000Z"),
      },
    ]

    expect(shapeVisibleComments(comments).map((comment) => comment.id)).toEqual(["comment-1"])
  })

  it("sorts visible comments oldest first", () => {
    const comments = [
      {
        id: "comment-2",
        content: "later",
        createdAt: new Date("2026-05-28T11:00:00.000Z"),
        deletedAt: null,
      },
      {
        id: "comment-1",
        content: "earlier",
        createdAt: new Date("2026-05-28T10:00:00.000Z"),
        deletedAt: null,
      },
    ]

    expect(shapeVisibleComments(comments).map((comment) => comment.id)).toEqual([
      "comment-1",
      "comment-2",
    ])
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npm test -- __tests__/lib/posts.test.ts
```

Expected output:

```text
FAIL  __tests__/lib/posts.test.ts
Error: Failed to resolve import "@/lib/posts"
```

- [ ] **Step 3: Implement query shaping helpers**

Create `nextjs-boilerplate/lib/posts.ts`:

```ts
import { cache } from "react"
import { getDb } from "@/lib/db"

type RawComment = {
  id: string
  content: string
  createdAt: Date
  deletedAt: Date | null
}

export function shapeVisibleComments<T extends RawComment>(comments: T[]) {
  return comments
    .filter((comment) => comment.deletedAt === null)
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
}

export const getPostDetail = cache(async (postId: string) => {
  const db = getDb()

  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!post) {
    return null
  }

  return {
    ...post,
    comments: shapeVisibleComments(post.comments),
  }
})
```

- [ ] **Step 4: Run the shaping tests and verify they pass**

Run:

```bash
npm test -- __tests__/lib/posts.test.ts
```

Expected output:

```text
... __tests__/lib/posts.test.ts ...
... 2 passed ...
```

- [ ] **Step 5: Commit**

```bash
git add lib/posts.ts __tests__/lib/posts.test.ts
git commit -m "feat: add post detail query helpers"
```

---

### Task 5: Add authenticated session helpers and comment server actions

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/lib/session.ts`
- Create: `nextjs-boilerplate/app/posts/[postId]/actions.ts`
- Modify: `nextjs-boilerplate/lib/comments.ts`

- [ ] **Step 1: Extend the comment helper for action payloads**

Replace `nextjs-boilerplate/lib/comments.ts` with:

```ts
import type { UserRole } from "@prisma/client"

export const COMMENT_MAX_LENGTH = 1000

type DeletePermissionInput = {
  actorId: string
  actorRole: UserRole
  commentAuthorId: string
}

export function validateCommentContent(content: string) {
  const trimmed = content.trim()

  if (!trimmed) {
    throw new Error("Comment cannot be empty.")
  }

  if (trimmed.length > COMMENT_MAX_LENGTH) {
    throw new Error(`Comment must be ${COMMENT_MAX_LENGTH} characters or less.`)
  }

  return trimmed
}

export function canDeleteComment(input: DeletePermissionInput) {
  return input.actorId === input.commentAuthorId || input.actorRole === "ADMIN"
}

export function getCommentActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Unable to process your comment right now."
}
```

- [ ] **Step 2: Add a required-session helper**

Create `nextjs-boilerplate/lib/session.ts`:

```ts
import { auth } from "@/lib/auth"

export async function requireSessionUser() {
  const session = await auth()

  if (!session?.user?.id || !session.user.role) {
    throw new Error("You must be logged in to perform this action.")
  }

  return session.user
}
```

- [ ] **Step 3: Add comment create/delete server actions**

Create `nextjs-boilerplate/app/posts/[postId]/actions.ts`:

```ts
"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "@/lib/db"
import { canDeleteComment, validateCommentContent } from "@/lib/comments"
import { requireSessionUser } from "@/lib/session"

export async function createComment(postId: string, _prevState: string | null, formData: FormData) {
  try {
    const user = await requireSessionUser()
    const db = getDb()
    const content = validateCommentContent(String(formData.get("content") ?? ""))

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return "Post not found."
    }

    await db.comment.create({
      data: {
        postId,
        authorId: user.id,
        content,
      },
    })

    revalidatePath(`/posts/${postId}`)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : "Unable to create comment."
  }
}

export async function deleteComment(postId: string, commentId: string) {
  const user = await requireSessionUser()
  const db = getDb()

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      deletedAt: true,
    },
  })

  if (!comment) {
    throw new Error("Comment not found.")
  }

  if (comment.deletedAt) {
    throw new Error("Comment already deleted.")
  }

  if (
    !canDeleteComment({
      actorId: user.id,
      actorRole: user.role,
      commentAuthorId: comment.authorId,
    })
  ) {
    throw new Error("You do not have permission to delete this comment.")
  }

  await db.comment.update({
    where: { id: commentId },
    data: {
      deletedAt: new Date(),
    },
  })

  revalidatePath(`/posts/${postId}`)
}
```

- [ ] **Step 4: Run lint for action modules**

Run:

```bash
npx eslint lib/comments.ts lib/session.ts app/posts/[postId]/actions.ts
```

Expected output:

```text
```

- [ ] **Step 5: Commit**

```bash
git add lib/comments.ts lib/session.ts app/posts/[postId]/actions.ts
git commit -m "feat: add comment server actions"
```

---

### Task 6: Build the post detail page and comment UI

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/components/posts/comment-form.tsx`
- Create: `nextjs-boilerplate/components/posts/comment-list.tsx`
- Create: `nextjs-boilerplate/app/posts/[postId]/page.tsx`

- [ ] **Step 1: Create the comment form component**

Create `nextjs-boilerplate/components/posts/comment-form.tsx`:

```tsx
"use client"

import { useActionState } from "react"
import { createComment } from "@/app/posts/[postId]/actions"
import { Button } from "@/components/ui/button"

type CommentFormProps = {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [errorMessage, formAction, isPending] = useActionState(
    createComment.bind(null, postId),
    null
  )

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        name="content"
        rows={4}
        required
        maxLength={1000}
        placeholder="댓글을 남겨보세요."
        className="w-full rounded-md border p-3 text-sm"
      />
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "등록 중..." : "댓글 등록"}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create the comment list component**

Create `nextjs-boilerplate/components/posts/comment-list.tsx`:

```tsx
import { deleteComment } from "@/app/posts/[postId]/actions"
import { Button } from "@/components/ui/button"

type CommentListProps = {
  postId: string
  viewerId?: string
  viewerRole?: "USER" | "ADMIN"
  comments: {
    id: string
    content: string
    createdAt: Date
    authorId: string
    author: {
      name: string | null
      email: string
    }
  }[]
}

export function CommentList({ comments, postId, viewerId, viewerRole }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">첫 댓글을 남겨보세요.</p>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canDelete = viewerId === comment.authorId || viewerRole === "ADMIN"

        return (
          <article key={comment.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{comment.author.name ?? comment.author.email}</p>
                <p className="text-xs text-muted-foreground">
                  {comment.createdAt.toLocaleString("ko-KR")}
                </p>
              </div>
              {canDelete ? (
                <form action={deleteComment.bind(null, postId, comment.id)}>
                  <Button type="submit" variant="ghost">
                    삭제
                  </Button>
                </form>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{comment.content}</p>
          </article>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create the post detail page**

Create `nextjs-boilerplate/app/posts/[postId]/page.tsx`:

```tsx
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getPostDetail } from "@/lib/posts"
import { CommentForm } from "@/components/posts/comment-form"
import { CommentList } from "@/components/posts/comment-list"

type PostPageProps = {
  params: Promise<{
    postId: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params
  const [session, post] = await Promise.all([auth(), getPostDetail(postId)])

  if (!post) {
    notFound()
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-8">
      <article className="rounded-xl border p-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          작성자 {post.author.name ?? post.author.email}
        </p>
        <div className="mt-6 whitespace-pre-wrap text-base">{post.content}</div>
      </article>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">댓글 {post.comments.length}</h2>
        </div>

        {session?.user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-muted-foreground">댓글을 작성하려면 로그인해 주세요.</p>
        )}

        <CommentList
          postId={post.id}
          viewerId={session?.user?.id}
          viewerRole={session?.user?.role}
          comments={post.comments}
        />
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Run lint for the page and components**

Run:

```bash
npx eslint app/posts/[postId]/page.tsx components/posts/comment-form.tsx components/posts/comment-list.tsx
```

Expected output:

```text
```

- [ ] **Step 5: Commit**

```bash
git add app/posts/[postId]/page.tsx components/posts/comment-form.tsx components/posts/comment-list.tsx
git commit -m "feat: add post detail comments ui"
```

---

### Task 7: Verify end-to-end behavior and document local checks

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Modify: `nextjs-boilerplate/README.md` (only if local verification steps are missing)

- [ ] **Step 1: Run the focused test suite**

Run:

```bash
npm test -- __tests__/lib/comments.test.ts __tests__/lib/posts.test.ts
```

Expected output:

```text
... 8 passed ...
```

- [ ] **Step 2: Run the full project checks**

Run:

```bash
npm test
npx eslint .
```

Expected output:

```text
... all tests passed ...
```

and then:

```text
```

No ESLint output means success.

- [ ] **Step 3: Manually verify with local data**

Run:

```bash
npm run dev
```

Manual checks:

- Open a known existing post at `http://localhost:3000/posts/<postId>`
- Confirm logged-out users see the login prompt instead of the form
- Sign in as a normal user and confirm comment submission works
- Confirm the new comment appears at the bottom when it is the newest comment
- Confirm the author sees the delete button on their own comment
- Sign in as an admin user and confirm delete is available on every comment
- Confirm deleted comments disappear after refresh/navigation

- [ ] **Step 4: Add a short README note if needed**

If `nextjs-boilerplate/README.md` does not mention how to create a local post for verification, append:

```md
## Verifying post comments locally

1. Run `npm run db:push`
2. Run `npm run dev`
3. Create a user and a post in Prisma Studio or your local database
4. Visit `/posts/<postId>` and verify comment create/delete behavior
```

- [ ] **Step 5: Commit README notes only if Step 4 changed the file**

Run only when `README.md` was modified in Step 4:

```bash
git add README.md
git commit -m "docs: add post comments verification notes"
```

---

## Spec Coverage Check

- `User.role = ADMIN` support is covered in Task 1 and Task 2.
- `Post` and `Comment` minimum data model is covered in Task 1.
- Logged-in-only comment creation is covered in Task 5 and Task 6.
- Author/admin delete permission is covered in Task 3 and Task 5.
- Oldest-first visible comment rendering is covered in Task 4 and Task 6.
- Soft delete behavior is covered in Task 1, Task 4, and Task 5.
- Error handling for empty, oversized, missing, unauthorized, and already-deleted comments is covered in Task 3 and Task 5.
- Test coverage for validation, permission, filtering, and sorting is covered in Task 3, Task 4, and Task 7.

## Self-Review

- No placeholder markers such as `TODO` or `TBD` remain in the plan.
- File and symbol names are consistent across tasks: `validateCommentContent`, `canDeleteComment`, `getPostDetail`, `createComment`, and `deleteComment`.
- The plan stays within the approved scope: one-level comments, immediate publish, and delete-only moderation.
