import Link from "next/link"

import { PostList } from "@/components/posts/post-list"
import { PostScopeTabs } from "@/components/posts/post-scope-tabs"
import { buttonVariants } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { normalizePostScope } from "@/lib/post-management"
import { getDashboardPosts } from "@/lib/posts"
import { cn } from "@/lib/utils"

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Browse, create, and manage posts.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          New post
        </Link>
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
