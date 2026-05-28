import Link from "next/link"
import { notFound } from "next/navigation"

import { CommentForm } from "@/components/posts/comment-form"
import { CommentList } from "@/components/posts/comment-list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { getPostDetail } from "@/lib/posts"

type PostDetailPageProps = {
  params: Promise<{
    postId: string
  }>
}

export default async function PostDetailPage({
  params,
}: PostDetailPageProps) {
  const { postId } = await params
  const [session, post] = await Promise.all([auth(), getPostDetail(postId)])

  if (!post) {
    notFound()
  }

  const commentCount = post.comments.length

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <CardDescription>
            By {post.author.name ?? post.author.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap leading-7 text-foreground/90">
            {post.content}
          </p>
          <p className="text-sm text-muted-foreground">
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </p>
        </CardContent>
      </Card>

      {session?.user ? (
        <CommentForm postId={postId} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Join the conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary underline">
                Log in
              </Link>{" "}
              to leave a comment.
            </p>
          </CardContent>
        </Card>
      )}

      <CommentList
        comments={post.comments}
        postId={postId}
        viewerUserId={session?.user?.id}
        viewerRole={session?.user?.role}
      />
    </main>
  )
}
