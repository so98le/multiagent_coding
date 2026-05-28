"use client"

import { useActionState } from "react"

import { createComment } from "@/app/posts/[postId]/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CommentFormProps = {
  postId: string
}

const INITIAL_STATE: string | null = null

export function CommentForm({ postId }: CommentFormProps) {
  const createCommentAction = createComment.bind(null, postId)
  const [errorMessage, formAction, isPending] = useActionState(
    createCommentAction,
    INITIAL_STATE,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a comment</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <textarea
            name="content"
            rows={4}
            required
            minLength={1}
            maxLength={1000}
            placeholder="Share your thoughts about this post."
            className="flex min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
