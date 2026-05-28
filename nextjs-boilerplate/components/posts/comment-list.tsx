"use client"

import { useActionState } from "react"
import type { UserRole } from "@prisma/client"

import { deleteComment } from "@/app/posts/[postId]/actions"
import { canDeleteComment } from "@/lib/comments"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CommentItem = {
  id: string
  content: string
  createdAt: Date
  authorId: string
  author: {
    name: string | null
    email: string
  }
}

type CommentListProps = {
  comments: CommentItem[]
  postId: string
  viewerUserId?: string
  viewerRole?: UserRole
}

type DeleteCommentButtonProps = {
  commentId: string
  postId: string
}

const INITIAL_DELETE_STATE: string | null = null

function formatCommentDate(createdAt: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt)
}

function getCommentAuthorLabel(comment: CommentItem) {
  return comment.author.name ?? comment.author.email
}

function DeleteCommentButton({
  commentId,
  postId,
}: DeleteCommentButtonProps) {
  const deleteCommentAction = deleteComment.bind(null, postId, commentId)
  const [errorMessage, formAction, isPending] = useActionState(
    deleteCommentAction,
    INITIAL_DELETE_STATE,
  )

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
    </form>
  )
}

export function CommentList({
  comments,
  postId,
  viewerUserId,
  viewerRole,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>No comments yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start the discussion by leaving the first comment.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canViewerDelete =
          !!viewerUserId &&
          !!viewerRole &&
          canDeleteComment({
            actorId: viewerUserId,
            actorRole: viewerRole,
            commentAuthorId: comment.authorId,
          })

        return (
          <Card key={comment.id}>
            <CardHeader>
              <CardTitle>{getCommentAuthorLabel(comment)}</CardTitle>
              <CardDescription>
                {formatCommentDate(new Date(comment.createdAt))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6">
                {comment.content}
              </p>
            </CardContent>
            {canViewerDelete ? (
              <CardFooter className="justify-end">
                <DeleteCommentButton commentId={comment.id} postId={postId} />
              </CardFooter>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
