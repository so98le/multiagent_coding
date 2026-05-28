# Dashboard Post Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/dashboard` into an authenticated post management hub with `전체 글 / 내 글` tabs, latest-first listing, post creation, post editing, and author/admin deletion in `nextjs-boilerplate/`.

**Architecture:** Keep the feature server-first. `lib/posts.ts` owns post list/detail queries and post permission helpers, server actions own create/update/delete mutations, and dashboard pages render from URL-driven scope state. Existing public post detail and comment behavior remain unchanged and are reused instead of duplicating read routes.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, Auth.js v5, PostgreSQL, Vitest, shadcn/ui

---

## File Map

**Create:**
- `nextjs-boilerplate/app/(dashboard)/dashboard/posts/actions.ts` - server actions for create, update, delete
- `nextjs-boilerplate/app/(dashboard)/dashboard/posts/new/page.tsx` - new post page
- `nextjs-boilerplate/app/(dashboard)/dashboard/posts/[postId]/edit/page.tsx` - edit post page
- `nextjs-boilerplate/components/posts/post-editor-form.tsx` - reusable create/edit post form
- `nextjs-boilerplate/components/posts/post-list.tsx` - dashboard post list with per-row controls
- `nextjs-boilerplate/components/posts/post-scope-tabs.tsx` - `all/mine` dashboard tabs
- `nextjs-boilerplate/__tests__/lib/post-management.test.ts` - post scope, ordering, and post permission tests

**Modify:**
- `nextjs-boilerplate/lib/posts.ts` - add post list queries, scope parsing, and post permission helpers
- `nextjs-boilerplate/app/(dashboard)/dashboard/page.tsx` - replace welcome-only dashboard with tabs, list, and create CTA
- `nextjs-boilerplate/proxy.ts` - keep dashboard protected while preserving existing public post detail behavior only if route rules need adjustment
- `nextjs-boilerplate/README.md` - add dashboard post management verification notes only if needed

---

### Task 1: Add post scope parsing and post permission helpers

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Modify: `nextjs-boilerplate/lib/posts.ts`
- Create: `nextjs-boilerplate/__tests__/lib/post-management.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `nextjs-boilerplate/__tests__/lib/post-management.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  canDeletePost,
  canEditPost,
  normalizePostScope,
  sortPostsNewestFirst,
} from "@/lib/posts"

describe("normalizePostScope", () => {
  it("returns all for a missing scope", () => {
    expect(normalizePostScope(undefined)).toBe("all")
  })

  it("returns all for an invalid scope", () => {
    expect(normalizePostScope("unexpected")).toBe("all")
  })

  it("preserves mine for a valid scope", () => {
    expect(normalizePostScope("mine")).toBe("mine")
  })
})

describe("sortPostsNewestFirst", () => {
  it("sorts posts by descending createdAt", () => {
    const posts = [
      { id: "post-1", createdAt: new Date("2026-05-28T10:00:00.000Z") },
      { id: "post-2", createdAt: new Date("2026-05-28T12:00:00.000Z") },
      { id: "post-3", createdAt: new Date("2026-05-28T11:00:00.000Z") },
    ]

    expect(sortPostsNewestFirst(posts).map((post) => post.id)).toEqual([
      "post-2",
      "post-3",
      "post-1",
    ])
  })
})

describe("post permissions", () => {
  it("allows the author to edit", () => {
    expect(canEditPost({ actorId: "user-1", postAuthorId: "user-1" })).toBe(true)
  })

  it("prevents a non-author from editing", () => {
    expect(canEditPost({ actorId: "user-2", postAuthorId: "user-1" })).toBe(false)
  })

  it("allows the author to delete", () => {
    expect(
      canDeletePost({
        actorId: "user-1",
        actorRole: "USER",
        postAuthorId: "user-1",
      })
    ).toBe(true)
  })

  it("allows admins to delete any post", () => {
    expect(
      canDeletePost({
        actorId: "admin-1",
        actorRole: "ADMIN",
        postAuthorId: "user-1",
      })
    ).toBe(true)
  })

  it("prevents unrelated users from deleting", () => {
    expect(
      canDeletePost({
        actorId: "user-2",
        actorRole: "USER",
        postAuthorId: "user-1",
      })
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npm test -- __tests__/lib/post-management.test.ts
```

Expected output:

```text
FAIL  __tests__/lib/post-management.test.ts
Error: Missing exports from "@/lib/posts"
```

- [ ] **Step 3: Implement scope and permission helpers**

Update `nextjs-boilerplate/lib/posts.ts` to add:

```ts
import type { UserRole } from "@prisma/client"

export type PostScope = "all" | "mine"

type PostSortShape = {
  createdAt: Date
}

type EditPostPermissionInput = {
  actorId: string
  postAuthorId: string
}

type DeletePostPermissionInput = {
  actorId: string
  actorRole: UserRole
  postAuthorId: string
}

export function normalizePostScope(scope: string | undefined): PostScope {
  return scope === "mine" ? "mine" : "all"
}

export function sortPostsNewestFirst<T extends PostSortShape>(posts: T[]) {
  return [...posts].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  )
}

export function canEditPost(input: EditPostPermissionInput) {
  return input.actorId === input.postAuthorId
}

export function canDeletePost(input: DeletePostPermissionInput) {
  return input.actorId === input.postAuthorId || input.actorRole === "ADMIN"
}
```

- [ ] **Step 4: Run the focused tests and verify they pass**

Run:

```bash
npm test -- __tests__/lib/post-management.test.ts
```

Expected output:

```text
... __tests__/lib/post-management.test.ts ...
... 8 passed ...
```

- [ ] **Step 5: Commit**

```bash
git add lib/posts.ts __tests__/lib/post-management.test.ts
git commit -m "feat: add post management helpers"
```

---

### Task 2: Add dashboard post queries

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Modify: `nextjs-boilerplate/lib/posts.ts`

- [ ] **Step 1: Add list and editable-post queries**

Extend `nextjs-boilerplate/lib/posts.ts` with:

```ts
export const getDashboardPosts = cache(
  async (scope: PostScope, userId: string) => {
    const posts = await getDb().post.findMany({
      where: scope === "mine" ? { authorId: userId } : undefined,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return sortPostsNewestFirst(posts)
  }
)

export const getEditablePost = cache(async (postId: string) => {
  return getDb().post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      content: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
    },
  })
})
```

- [ ] **Step 2: Run full TypeScript validation**

Run:

```bash
npx tsc --noEmit --pretty false
```

Expected output:

```text
```

No output means success.

- [ ] **Step 3: Commit**

```bash
git add lib/posts.ts
git commit -m "feat: add dashboard post queries"
```

---

### Task 3: Add post create, update, and delete server actions

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/app/(dashboard)/dashboard/posts/actions.ts`
- Modify: `nextjs-boilerplate/lib/posts.ts`

- [ ] **Step 1: Extend post helpers with validation and error constants**

Add to `nextjs-boilerplate/lib/posts.ts`:

```ts
export const EMPTY_POST_TITLE_ERROR = "Title cannot be empty."
export const EMPTY_POST_CONTENT_ERROR = "Content cannot be empty."
export const POST_NOT_FOUND_ERROR = "Post not found."
export const UNAUTHORIZED_POST_EDIT_ERROR = "You do not have permission to edit this post."
export const UNAUTHORIZED_POST_DELETE_ERROR = "You do not have permission to delete this post."

export function validatePostTitle(title: string) {
  const trimmed = title.trim()

  if (!trimmed) {
    throw new Error(EMPTY_POST_TITLE_ERROR)
  }

  return trimmed
}

export function validatePostContent(content: string) {
  const trimmed = content.trim()

  if (!trimmed) {
    throw new Error(EMPTY_POST_CONTENT_ERROR)
  }

  return trimmed
}
```

- [ ] **Step 2: Add post actions**

Create `nextjs-boilerplate/app/(dashboard)/dashboard/posts/actions.ts`:

```ts
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getDb } from "@/lib/db"
import {
  canDeletePost,
  canEditPost,
  EMPTY_POST_CONTENT_ERROR,
  EMPTY_POST_TITLE_ERROR,
  getEditablePost,
  POST_NOT_FOUND_ERROR,
  UNAUTHORIZED_POST_DELETE_ERROR,
  UNAUTHORIZED_POST_EDIT_ERROR,
  validatePostContent,
  validatePostTitle,
} from "@/lib/posts"
import {
  MissingSessionUserError,
  requireSessionUser,
} from "@/lib/session"

const CREATE_POST_ERROR = "Unable to create post."
const UPDATE_POST_ERROR = "Unable to update post."
const DELETE_POST_ERROR = "Unable to delete post."

function getPostActionErrorMessage(error: unknown) {
  if (error instanceof MissingSessionUserError) {
    return error.message
  }

  if (!(error instanceof Error)) {
    return null
  }

  switch (error.message) {
    case EMPTY_POST_TITLE_ERROR:
    case EMPTY_POST_CONTENT_ERROR:
    case POST_NOT_FOUND_ERROR:
    case UNAUTHORIZED_POST_EDIT_ERROR:
    case UNAUTHORIZED_POST_DELETE_ERROR:
      return error.message
    default:
      return null
  }
}

export async function createPost(
  _prevState: string | null,
  formData: FormData
) {
  try {
    const user = await requireSessionUser()
    const title = validatePostTitle(String(formData.get("title") ?? ""))
    const content = validatePostContent(String(formData.get("content") ?? ""))

    const post = await getDb().post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
      select: {
        id: true,
      },
    })

    revalidatePath("/dashboard")
    redirect(`/posts/${post.id}`)
  } catch (error) {
    return getPostActionErrorMessage(error) ?? CREATE_POST_ERROR
  }
}

export async function updatePost(
  postId: string,
  _prevState: string | null,
  formData: FormData
) {
  try {
    const user = await requireSessionUser()
    const post = await getEditablePost(postId)

    if (!post) {
      throw new Error(POST_NOT_FOUND_ERROR)
    }

    if (!canEditPost({ actorId: user.id, postAuthorId: post.authorId })) {
      throw new Error(UNAUTHORIZED_POST_EDIT_ERROR)
    }

    const title = validatePostTitle(String(formData.get("title") ?? ""))
    const content = validatePostContent(String(formData.get("content") ?? ""))

    await getDb().post.update({
      where: { id: postId },
      data: {
        title,
        content,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/posts/${postId}`)
    redirect(`/posts/${postId}`)
  } catch (error) {
    return getPostActionErrorMessage(error) ?? UPDATE_POST_ERROR
  }
}

export async function deletePost(postId: string) {
  try {
    const user = await requireSessionUser()
    const post = await getEditablePost(postId)

    if (!post) {
      throw new Error(POST_NOT_FOUND_ERROR)
    }

    if (
      !canDeletePost({
        actorId: user.id,
        actorRole: user.role,
        postAuthorId: post.authorId,
      })
    ) {
      throw new Error(UNAUTHORIZED_POST_DELETE_ERROR)
    }

    await getDb().post.delete({
      where: { id: postId },
    })

    revalidatePath("/dashboard")
    revalidatePath(`/posts/${postId}`)
    return null
  } catch (error) {
    return getPostActionErrorMessage(error) ?? DELETE_POST_ERROR
  }
}
```

- [ ] **Step 3: Run lint and typecheck**

Run:

```bash
npx eslint app/(dashboard)/dashboard/posts/actions.ts lib/posts.ts
npx tsc --noEmit --pretty false
```

Expected output:

```text
```

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/dashboard/posts/actions.ts lib/posts.ts
git commit -m "feat: add post management server actions"
```

---

### Task 4: Build reusable post form and dashboard list components

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/components/posts/post-editor-form.tsx`
- Create: `nextjs-boilerplate/components/posts/post-list.tsx`
- Create: `nextjs-boilerplate/components/posts/post-scope-tabs.tsx`

- [ ] **Step 1: Create the reusable post editor form**

Create `nextjs-boilerplate/components/posts/post-editor-form.tsx`:

```tsx
"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PostEditorFormProps = {
  action: (state: string | null, formData: FormData) => Promise<string | null>
  initialContent?: string
  initialTitle?: string
  submitLabel: string
  title: string
}

const INITIAL_STATE: string | null = null

export function PostEditorForm({
  action,
  initialContent = "",
  initialTitle = "",
  submitLabel,
  title,
}: PostEditorFormProps) {
  const [errorMessage, formAction, isPending] = useActionState(
    action,
    INITIAL_STATE
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={initialTitle}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              defaultValue={initialContent}
              rows={10}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create the scope tabs**

Create `nextjs-boilerplate/components/posts/post-scope-tabs.tsx`:

```tsx
import Link from "next/link"

import type { PostScope } from "@/lib/posts"
import { cn } from "@/lib/utils"

type PostScopeTabsProps = {
  scope: PostScope
}

export function PostScopeTabs({ scope }: PostScopeTabsProps) {
  const tabs = [
    { href: "/dashboard?scope=all", label: "전체 글", value: "all" },
    { href: "/dashboard?scope=mine", label: "내 글", value: "mine" },
  ] as const

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = tab.value === scope

        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={cn(
              "rounded-md border px-3 py-2 text-sm transition",
              isActive
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create the post list**

Create `nextjs-boilerplate/components/posts/post-list.tsx`:

```tsx
"use client"

import Link from "next/link"
import { useActionState } from "react"
import type { UserRole } from "@prisma/client"

import { deletePost } from "@/app/(dashboard)/dashboard/posts/actions"
import { canDeletePost, canEditPost } from "@/lib/posts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PostListProps = {
  posts: Array<{
    id: string
    title: string
    content: string
    createdAt: Date
    authorId: string
    author: {
      id: string
      name: string | null
      email: string
    }
  }>
  viewerUserId: string
  viewerRole: UserRole
}

type DeletePostButtonProps = {
  postId: string
}

const INITIAL_STATE: string | null = null

function DeletePostButton({ postId }: DeletePostButtonProps) {
  const action = deletePost.bind(null, postId)
  const [errorMessage, formAction, isPending] = useActionState(action, INITIAL_STATE)

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  )
}

export function PostList({ posts, viewerUserId, viewerRole }: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>게시글이 없습니다.</CardTitle>
          <CardDescription>첫 게시글을 작성해보세요.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const canEdit = canEditPost({
          actorId: viewerUserId,
          postAuthorId: post.authorId,
        })
        const canDelete = canDeletePost({
          actorId: viewerUserId,
          actorRole: viewerRole,
          postAuthorId: post.authorId,
        })

        return (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription>
                {post.author.name ?? post.author.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {post.content}
              </p>
            </CardContent>
            {(canEdit || canDelete) ? (
              <CardFooter className="justify-end gap-2">
                {canEdit ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/posts/${post.id}/edit`}>Edit</Link>
                  </Button>
                ) : null}
                {canDelete ? <DeletePostButton postId={post.id} /> : null}
              </CardFooter>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run lint for the components**

Run:

```bash
npx eslint components/posts/post-editor-form.tsx components/posts/post-list.tsx components/posts/post-scope-tabs.tsx
```

Expected output:

```text
```

- [ ] **Step 5: Commit**

```bash
git add components/posts/post-editor-form.tsx components/posts/post-list.tsx components/posts/post-scope-tabs.tsx
git commit -m "feat: add dashboard post management components"
```

---

### Task 5: Replace dashboard welcome page with post management UI

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Modify: `nextjs-boilerplate/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace the dashboard page**

Replace `nextjs-boilerplate/app/(dashboard)/dashboard/page.tsx` with:

```tsx
import Link from "next/link"

import { PostList } from "@/components/posts/post-list"
import { PostScopeTabs } from "@/components/posts/post-scope-tabs"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { getDashboardPosts, normalizePostScope } from "@/lib/posts"

type DashboardPageProps = {
  searchParams?: Promise<{
    scope?: string
  }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth()
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const scope = normalizePostScope(resolvedSearchParams?.scope)
  const posts = await getDashboardPosts(scope, session!.user.id)

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">
            게시글을 작성하고 관리할 수 있습니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new">새 글 작성</Link>
        </Button>
      </div>

      <PostScopeTabs scope={scope} />

      <PostList
        posts={posts}
        viewerUserId={session!.user.id}
        viewerRole={session!.user.role}
      />
    </main>
  )
}
```

- [ ] **Step 2: Run lint and typecheck**

Run:

```bash
npx eslint app/(dashboard)/dashboard/page.tsx
npx tsc --noEmit --pretty false
```

Expected output:

```text
```

- [ ] **Step 3: Commit**

```bash
git add app/(dashboard)/dashboard/page.tsx
git commit -m "feat: add dashboard post listing"
```

---

### Task 6: Add post create and edit pages

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Create: `nextjs-boilerplate/app/(dashboard)/dashboard/posts/new/page.tsx`
- Create: `nextjs-boilerplate/app/(dashboard)/dashboard/posts/[postId]/edit/page.tsx`

- [ ] **Step 1: Create the new post page**

Create `nextjs-boilerplate/app/(dashboard)/dashboard/posts/new/page.tsx`:

```tsx
import { createPost } from "@/app/(dashboard)/dashboard/posts/actions"
import { PostEditorForm } from "@/components/posts/post-editor-form"

export default function NewPostPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <PostEditorForm
        action={createPost}
        submitLabel="작성하기"
        title="새 글 작성"
      />
    </main>
  )
}
```

- [ ] **Step 2: Create the edit post page**

Create `nextjs-boilerplate/app/(dashboard)/dashboard/posts/[postId]/edit/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation"

import { updatePost } from "@/app/(dashboard)/dashboard/posts/actions"
import { PostEditorForm } from "@/components/posts/post-editor-form"
import { auth } from "@/lib/auth"
import { canEditPost, getEditablePost } from "@/lib/posts"

type EditPostPageProps = {
  params: Promise<{
    postId: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { postId } = await params
  const [session, post] = await Promise.all([auth(), getEditablePost(postId)])

  if (!post) {
    notFound()
  }

  if (
    !canEditPost({
      actorId: session!.user.id,
      postAuthorId: post.authorId,
    })
  ) {
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <PostEditorForm
        action={updatePost.bind(null, post.id)}
        initialContent={post.content}
        initialTitle={post.title}
        submitLabel="수정하기"
        title="글 수정"
      />
    </main>
  )
}
```

- [ ] **Step 3: Run lint and typecheck**

Run:

```bash
npx eslint app/(dashboard)/dashboard/posts/new/page.tsx app/(dashboard)/dashboard/posts/[postId]/edit/page.tsx
npx tsc --noEmit --pretty false
```

Expected output:

```text
```

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/dashboard/posts/new/page.tsx app/(dashboard)/dashboard/posts/[postId]/edit/page.tsx
git commit -m "feat: add post create and edit pages"
```

---

### Task 7: Run verification and document manual checks

**Working directory:** `D:\vs_code_workspace\multiagent_coding\nextjs-boilerplate`

**Files:**
- Modify: `nextjs-boilerplate/README.md` only if the current verification section needs explicit dashboard post management steps

- [ ] **Step 1: Run the full automated checks**

Run:

```bash
npm test
npx eslint .
npx tsc --noEmit --pretty false
```

Expected output:

```text
... all tests passed ...
```

and then no ESLint or TypeScript output.

- [ ] **Step 2: Manually verify the dashboard flow**

Run:

```bash
npm run dev
```

Manual checks:

- Visit `/dashboard?scope=all` and confirm newest-first listing
- Visit `/dashboard?scope=mine` and confirm only the current user's posts are shown
- Change `scope` to an invalid value and confirm the page still behaves like `all`
- Create a post from `/dashboard/posts/new`
- Edit your post from `/dashboard/posts/[postId]/edit`
- Confirm authors can delete their own posts
- Confirm admins can delete other users' posts
- Confirm post detail at `/posts/[postId]` still loads publicly

- [ ] **Step 3: Update README only if needed**

If the root `README.md` does not already describe dashboard post management clearly, append a short section covering:

```md
## Dashboard post management

- `/dashboard?scope=all` shows all posts
- `/dashboard?scope=mine` shows only the logged-in user's posts
- `/dashboard/posts/new` creates a post
- `/dashboard/posts/[postId]/edit` edits a post
```

- [ ] **Step 4: Commit README notes only if Step 3 changed the file**

Run only when the file changed:

```bash
git add README.md
git commit -m "docs: add dashboard post management notes"
```

---

## Spec Coverage Check

- Dashboard `all/mine` tabs are covered in Task 1, Task 2, Task 4, and Task 5.
- Latest-first list ordering is covered in Task 1 and Task 2.
- Separate create page is covered in Task 3 and Task 6.
- Separate edit page is covered in Task 3 and Task 6.
- Author edit/delete and admin delete rules are covered in Task 1, Task 3, Task 4, and Task 6.
- Invalid `scope` fallback is covered in Task 1 and Task 7.
- Existing public post detail preservation is covered in Task 7.

## Self-Review

- No placeholders such as `TODO` or `TBD` remain.
- File and symbol names are consistent across tasks: `normalizePostScope`, `sortPostsNewestFirst`, `canEditPost`, `canDeletePost`, `getDashboardPosts`, `getEditablePost`, `createPost`, `updatePost`, `deletePost`.
- The plan stays inside the approved scope: dashboard list, tabs, create/edit pages, and author/admin delete behavior.
