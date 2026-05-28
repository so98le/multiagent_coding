import type { UserRole } from "@prisma/client"

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
  return [...posts].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  )
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

export function canEditPost({
  actorId,
  postAuthorId,
}: EditPostPermissionInput) {
  return actorId === postAuthorId
}

export function canDeletePost({
  actorId,
  actorRole,
  postAuthorId,
}: DeletePostPermissionInput) {
  return actorRole === "ADMIN" || actorId === postAuthorId
}
