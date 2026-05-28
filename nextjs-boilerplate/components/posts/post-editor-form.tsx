"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type PostEditorFormProps = {
  action: (state: string | null, formData: FormData) => Promise<string | null>
  initialContent?: string
  initialTitle?: string
  submitLabel: string
  title: string
}

const INITIAL_STATE: string | null = null

export function PostEditorForm({
  action,
  initialContent = "",
  initialTitle = "",
  submitLabel,
  title,
}: PostEditorFormProps) {
  const [errorMessage, formAction, isPending] = useActionState(
    action,
    INITIAL_STATE,
  )

  return (
    <Card variant="feature">
      <CardHeader>
        <CardTitle className="text-heading-3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label className="text-body-sm-medium text-ink" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={initialTitle}
              placeholder="Enter post title..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-body-sm-medium text-ink" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              defaultValue={initialContent}
              rows={10}
              placeholder="Write your post content..."
              className="w-full h-auto min-h-[200px] rounded-md bg-canvas border border-hairline-strong px-4 py-3 text-body-md text-ink placeholder:text-steel transition-colors focus:border-brand-green-dark focus:ring-2 focus:ring-brand-green-dark/20 focus:outline-none"
              required
            />
          </div>
          {errorMessage ? (
            <p className="text-body-sm text-destructive">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
