import { cache } from "react"

import { getDb } from "@/lib/db"

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
