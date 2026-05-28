"use client"

import Link from "next/link"
import { useActionState } from "react"
import type { UserRole } from "@prisma/client"

import { deletePost } from "@/app/(dashboard)/dashboard/posts/actions"
import { canDeletePost, canEditPost } from "@/lib/post-management"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type PostListItem = {
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
}

type PostListProps = {
  posts: PostListItem[]
  viewerUserId: string
  viewerRole: UserRole
}

type DeletePostButtonProps = {
  postId: string
}

const INITIAL_STATE: string | null = null

function formatPostDate(createdAt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt)
}

function DeletePostButton({ postId }: DeletePostButtonProps) {
  const deletePostAction = deletePost.bind(null, postId)
  const [errorMessage, formAction, isPending] = useActionState(
    deletePostAction,
    INITIAL_STATE,
  )

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      {errorMessage ? (
        <p className="text-caption-bold text-destructive">{errorMessage}</p>
      ) : null}
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  )
}

export function PostList({
  posts,
  viewerUserId,
  viewerRole,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle className="text-heading-4">No posts yet.</CardTitle>
          <CardDescription className="text-body-md">
            Create the first post from this dashboard.
          </CardDescription>
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
          <Card key={post.id} className="hover:shadow-card transition-shadow">
            <CardHeader>
              <CardTitle>
                <Link 
                  href={`/posts/${post.id}`} 
                  className="text-ink hover:text-brand-green-dark transition-colors"
                >
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="text-body-sm text-steel">
                {post.author.name ?? post.author.email} ·{" "}
                {formatPostDate(new Date(post.createdAt))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 whitespace-pre-wrap text-body-sm text-slate">
                {post.content}
              </p>
            </CardContent>
            {canEdit || canDelete ? (
              <CardFooter className="justify-end gap-2 pt-4 border-t border-hairline">
                {canEdit ? (
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <Button variant="secondary" size="sm">Edit</Button>
                  </Link>
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
