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
import { MissingSessionUserError, requireSessionUser } from "@/lib/session"

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
  formData: FormData,
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
  formData: FormData,
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
