"use server"

import { revalidatePath } from "next/cache"

import {
  canDeleteComment,
  COMMENT_ALREADY_DELETED_ERROR,
  COMMENT_NOT_FOUND_ERROR,
  getCommentActionErrorMessage,
  UNAUTHORIZED_DELETE_ERROR,
  validateCommentContent,
} from "@/lib/comments"
import { getDb } from "@/lib/db"
import {
  MissingSessionUserError,
  requireSessionUser,
} from "@/lib/session"

const CREATE_COMMENT_ERROR = "Unable to create comment."
const POST_NOT_FOUND_ERROR = "Post not found."
const DELETE_COMMENT_ERROR = "Unable to delete comment."

export async function createComment(
  postId: string,
  prevState: string | null,
  formData: FormData,
) {
  void prevState

  try {
    const sessionUser = await requireSessionUser()
    const rawContent = formData.get("content")
    const content = validateCommentContent(
      typeof rawContent === "string" ? rawContent : "",
    )

    const post = await getDb().post.findUnique({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return POST_NOT_FOUND_ERROR
    }

    await getDb().comment.create({
      data: {
        content,
        postId,
        authorId: sessionUser.id,
      },
    })

    revalidatePath(`/posts/${postId}`)
    return null
  } catch (error) {
    return getCreateCommentErrorMessage(error)
  }
}

export async function deleteComment(postId: string, commentId: string) {
  try {
    const sessionUser = await requireSessionUser()
    const comment = await getDb().comment.findFirst({
      where: {
        id: commentId,
        postId,
      },
      select: {
        id: true,
        authorId: true,
        deletedAt: true,
      },
    })

    if (!comment) {
      throw new Error(COMMENT_NOT_FOUND_ERROR)
    }

    if (comment.deletedAt) {
      throw new Error(COMMENT_ALREADY_DELETED_ERROR)
    }

    if (
      !canDeleteComment({
        actorId: sessionUser.id,
        actorRole: sessionUser.role,
        commentAuthorId: comment.authorId,
      })
    ) {
      throw new Error(UNAUTHORIZED_DELETE_ERROR)
    }

    await getDb().comment.update({
      where: { id: comment.id },
      data: {
        deletedAt: new Date(),
      },
    })

    revalidatePath(`/posts/${postId}`)
    return null
  } catch (error) {
    return getDeleteCommentErrorMessage(error)
  }
}

function getCreateCommentErrorMessage(error: unknown) {
  if (error instanceof MissingSessionUserError) {
    return error.message
  }

  const commentActionMessage = getCommentActionErrorMessage(error)

  if (commentActionMessage) {
    return commentActionMessage
  }

  return CREATE_COMMENT_ERROR
}

function getDeleteCommentErrorMessage(error: unknown) {
  if (error instanceof MissingSessionUserError) {
    return error.message
  }

  return getCommentActionErrorMessage(error) ?? DELETE_COMMENT_ERROR
}
