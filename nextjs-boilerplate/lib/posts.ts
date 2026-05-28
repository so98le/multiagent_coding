import { cache } from "react"
import type { UserRole } from "@prisma/client"

import { getDb } from "@/lib/db"

type CommentWithAuthor = {
  createdAt: Date
  deletedAt: Date | null
}

export type PostScope = "all" | "mine"

type PostWithCreatedAt = {
  createdAt: Date
}

type EditPostPermissionInput = {
  actorId: string
  postAuthorId: string
}

type DeletePostPermissionInput = EditPostPermissionInput & {
  actorRole: UserRole
}

export const EMPTY_POST_TITLE_ERROR = "Title cannot be empty."
export const EMPTY_POST_CONTENT_ERROR = "Content cannot be empty."
export const POST_NOT_FOUND_ERROR = "Post not found."
export const UNAUTHORIZED_POST_EDIT_ERROR =
  "You do not have permission to edit this post."
export const UNAUTHORIZED_POST_DELETE_ERROR =
  "You do not have permission to delete this post."

export function normalizePostScope(scope: unknown): PostScope {
  return scope === "mine" ? "mine" : "all"
}

export function sortPostsNewestFirst<T extends PostWithCreatedAt>(posts: T[]) {
  return [...posts].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
}

export function validatePostTitle(title: string) {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error(EMPTY_POST_TITLE_ERROR)
  }

  return trimmedTitle
}

export function validatePostContent(content: string) {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error(EMPTY_POST_CONTENT_ERROR)
  }

  return trimmedContent
}

export function canEditPost({ actorId, postAuthorId }: EditPostPermissionInput) {
  return actorId === postAuthorId
}

export function canDeletePost({
  actorId,
  actorRole,
  postAuthorId,
}: DeletePostPermissionInput) {
  return actorRole === "ADMIN" || actorId === postAuthorId
}

export function shapeVisibleComments<T extends CommentWithAuthor>(comments: T[]) {
  return comments
    .filter((comment) => comment.deletedAt === null)
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime())
}

export const getPostDetail = cache(async (postId: string) => {
  const post = await getDb().post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
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

export const getDashboardPosts = cache(async (scope: PostScope, userId: string) => {
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
})

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
