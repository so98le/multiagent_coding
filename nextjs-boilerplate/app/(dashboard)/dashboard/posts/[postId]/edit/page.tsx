import { notFound, redirect } from "next/navigation"

import { updatePost } from "@/app/(dashboard)/dashboard/posts/actions"
import { PostEditorForm } from "@/components/posts/post-editor-form"
import { auth } from "@/lib/auth"
import { canEditPost, getEditablePost } from "@/lib/posts"

type EditPostPageProps = {
  params: Promise<{
    postId: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { postId } = await params
  const [session, post] = await Promise.all([auth(), getEditablePost(postId)])

  if (!post) {
    notFound()
  }

  if (
    !canEditPost({
      actorId: session!.user.id,
      postAuthorId: post.authorId,
    })
  ) {
    redirect("/dashboard")
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <PostEditorForm
        action={updatePost.bind(null, post.id)}
        initialContent={post.content}
        initialTitle={post.title}
        submitLabel="Save changes"
        title="Edit post"
      />
    </main>
  )
}
