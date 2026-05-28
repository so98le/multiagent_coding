# Post Comments Design Spec

**Date:** 2026-05-28  
**Status:** Approved

## Overview

Add a cafe-style comment feature to the post detail page in `nextjs-boilerplate/`.
The first release is intentionally narrow:

- Comments exist only on the post detail page
- Only one-level comments are supported
- Only logged-in users can write comments
- Comments are visible immediately after submission
- Comment moderation is limited to delete permissions for authors and admins

This project currently has authentication infrastructure but does not yet have a post domain.
Because comments need a target entity, this design adds the minimum `Post` model and detail page needed to support comments cleanly.

## Goals

- Show comments on a post detail page
- Allow authenticated users to submit comments
- Allow the comment author to delete their own comment
- Allow admins to delete any comment
- Keep the implementation simple and aligned with the current App Router and Prisma setup

## Out of Scope

- Nested replies
- Anonymous comments
- Comment editing
- Comment reporting
- Admin approval workflow
- Real-time updates
- Post list or full forum features beyond the minimum detail-page support

## Approach

Use a server-rendered detail page with server-side mutations.

- Render the post and comment list in `app/posts/[postId]/page.tsx`
- Use Prisma for reads and writes
- Use server actions for comment creation and deletion
- Revalidate the post detail page after mutations

This is preferred over a fully API-driven approach because the codebase is still early-stage and already uses App Router server patterns. It minimizes moving parts while keeping authorization checks on the server.

## Data Model

### User

Extend `User` with a role field:

```prisma
enum UserRole {
  USER
  ADMIN
}
```

`User.role` defaults to `USER`.

### Post

Add a minimal post model so comments have a stable parent entity.

Required fields:

- `id`
- `title`
- `content`
- `authorId`
- `createdAt`
- `updatedAt`

Relationships:

- A post belongs to one user as author
- A post has many comments

### Comment

Add a one-level comment model.

Required fields:

- `id`
- `postId`
- `authorId`
- `content`
- `createdAt`
- `updatedAt`
- `deletedAt`

Design notes:

- `parentId` is intentionally excluded because only one-level comments are supported
- `deletedAt` enables soft delete, which is a better fit for admin moderation than hard delete
- Normal page queries only show comments where `deletedAt` is `null`

## Authorization Rules

- Unauthenticated users cannot create comments
- Authenticated users can create comments on existing posts
- A comment author can delete their own comment
- An admin can delete any comment
- Unauthorized delete attempts must be rejected on the server even if the UI hides the action

## Page and Request Flow

### Post Detail Page

Route:

- `app/posts/[postId]/page.tsx`

Behavior:

- Fetch the post by `postId`
- Fetch visible comments for that post
- Sort comments in ascending `createdAt` order so older comments appear first
- Show a comment count
- Show a comment form for authenticated users
- Show a login prompt for unauthenticated users

### Comment Creation

Submission flow:

1. User submits the comment form
2. Server action validates session, post existence, and content
3. Prisma creates the comment
4. The detail page is revalidated
5. The page renders the new comment in oldest-first order

### Comment Deletion

Deletion flow:

1. User clicks delete on a visible comment action
2. Server action validates session and permission
3. Prisma soft-deletes the comment by setting `deletedAt`
4. The detail page is revalidated
5. The deleted comment no longer appears in the normal list

## UI Scope

The first release includes only the following UI elements:

- Post title and content
- Comment count
- Comment list
- Comment form for logged-in users
- Login prompt for logged-out users
- Delete button for comment authors and admins
- Empty state when there are no comments
- Simple error and success feedback around comment actions

The comment list order is oldest first to match a stable cafe-style reading flow.

## Validation and Error Handling

### Create Comment

Reject the request when:

- The user is not logged in
- The target post does not exist
- The comment body is empty after trimming
- The comment body exceeds the chosen length limit

Expected handling:

- Return a clear user-facing error message
- Do not partially apply any mutation

### Delete Comment

Reject the request when:

- The user is not logged in
- The comment does not exist
- The comment is already deleted
- The user is neither the comment author nor an admin

Expected handling:

- Return a permission or state error
- Keep deletion logic server-enforced

## Testing

At minimum, cover:

- Prisma relations among `User`, `Post`, and `Comment`
- Authenticated user can create a comment
- Unauthenticated user cannot create a comment
- Comment author can delete their own comment
- Other non-admin users cannot delete someone else's comment
- Admin can delete any comment
- Deleted comments do not appear in detail-page queries
- Comments render in oldest-first order
- Empty and oversized comments are rejected

## Implementation Notes

- Follow existing auth patterns in `lib/auth.ts`
- Keep server-side permission checks close to the write path
- Avoid introducing reply, moderation queue, or reporting abstractions now
- If the app later needs richer moderation, `deletedAt` and `User.role` provide a clean base for expansion

## Open Decisions Resolved

These points were fixed during design and should not be reopened during implementation unless requirements change:

- Comments are one-level only
- Comment writing requires login
- Admins are identified by `User.role = ADMIN`
- Comments are visible immediately after submission
- Comment list order is oldest first
- Admin management in this phase means delete capability, not edit or approval
