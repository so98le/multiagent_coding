"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={initialTitle}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              defaultValue={initialContent}
              rows={10}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
