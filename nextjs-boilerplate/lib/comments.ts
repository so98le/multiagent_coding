import type { UserRole } from "@prisma/client"

export const COMMENT_MAX_LENGTH = 1000

export const EMPTY_COMMENT_ERROR = "Comment cannot be empty."
export const COMMENT_TOO_LONG_ERROR = `Comment must be ${COMMENT_MAX_LENGTH} characters or less.`

export function validateCommentContent(content: string) {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error(EMPTY_COMMENT_ERROR)
  }

  if (trimmedContent.length > COMMENT_MAX_LENGTH) {
    throw new Error(COMMENT_TOO_LONG_ERROR)
  }

  return trimmedContent
}

type CanDeleteCommentParams = {
  actorId: string
  actorRole: UserRole
  commentAuthorId: string
}

export function canDeleteComment({
  actorId,
  actorRole,
  commentAuthorId,
}: CanDeleteCommentParams) {
  return actorId === commentAuthorId || actorRole === "ADMIN"
}
