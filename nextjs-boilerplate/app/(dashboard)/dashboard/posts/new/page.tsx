import { createPost } from "@/app/(dashboard)/dashboard/posts/actions"
import { PostEditorForm } from "@/components/posts/post-editor-form"

export default function NewPostPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <PostEditorForm
        action={createPost}
        submitLabel="Create post"
        title="Create a new post"
      />
    </main>
  )
}
