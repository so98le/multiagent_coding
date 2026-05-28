import Link from "next/link"

import { PostList } from "@/components/posts/post-list"
import { PostScopeTabs } from "@/components/posts/post-scope-tabs"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { normalizePostScope } from "@/lib/post-management"
import { getDashboardPosts } from "@/lib/posts"

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
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-canvas border-b border-hairline">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🍃</span>
              <span className="text-heading-5 text-brand-green hidden sm:inline">Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-body-sm text-slate hidden sm:inline">
                {session?.user.name}
              </span>
              <Link href="/dashboard/posts/new">
                <Button size="sm">New post</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        {/* Page Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-heading-2 text-ink">Dashboard</h1>
            <p className="text-body-md text-slate mt-1">
              Browse, create, and manage posts.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <PostScopeTabs scope={scope} />
        </div>

        {/* Post List */}
        <PostList
          posts={posts}
          viewerUserId={session!.user.id}
          viewerRole={session!.user.role}
        />
      </div>
    </main>
  )
}
