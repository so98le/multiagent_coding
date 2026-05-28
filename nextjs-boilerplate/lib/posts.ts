import { cache } from "react"

import { getDb } from "@/lib/db"
import {
  sortPostsNewestFirst,
  type PostScope,
} from "@/lib/post-management"

type CommentWithAuthor = {
  createdAt: Date
  deletedAt: Date | null
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

export { sortPostsNewestFirst }
export type { PostScope } from "@/lib/post-management"
