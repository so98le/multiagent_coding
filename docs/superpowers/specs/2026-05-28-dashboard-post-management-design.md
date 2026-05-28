# Dashboard Post Management Design Spec

**Date:** 2026-05-28  
**Status:** Approved

## Overview

Extend the existing `nextjs-boilerplate/` app so `/dashboard` becomes a post management hub instead of a simple welcome page.

This feature adds:

- a latest-first post list on `/dashboard`
- a `전체 글 / 내 글` filter implemented as dashboard tabs
- a separate post creation page at `/dashboard/posts/new`
- a post edit page at `/dashboard/posts/[postId]/edit`
- post update/delete permissions for authors
- post delete permission for admins

The existing public post detail page at `/posts/[postId]` and comment system remain in place.

## Goals

- Show all posts or only the current user's posts from the dashboard
- Keep dashboard access authenticated
- Allow authenticated users to create posts
- Allow authors to edit and delete their own posts
- Allow admins to delete any post
- Reuse the existing public post detail route for reading and comments

## Out of Scope

- Post categories
- Search
- Pagination
- Rich text editing
- Draft/publish workflow
- Post reactions/bookmarks
- Admin-only moderation UI beyond delete permission

## Approach

Use server-rendered dashboard pages with URL-query-based tab state.

- `/dashboard?scope=all|mine` controls the selected tab
- the server reads the query and fetches the matching latest-first post list
- create/update/delete are handled with server actions
- successful mutations revalidate dashboard and post detail pages

This matches the current App Router and server-action structure and keeps permission checks server-side.

## Routing

### Dashboard

- `/dashboard`
- `/dashboard?scope=all`
- `/dashboard?scope=mine`

Behavior:

- requires login
- defaults invalid or missing `scope` to `all`
- shows a tab-like filter for `all` and `mine`
- shows posts sorted newest first

### Create Post

- `/dashboard/posts/new`

Behavior:

- requires login
- shows title/body form
- on success redirects to the new post detail page or dashboard

### Edit Post

- `/dashboard/posts/[postId]/edit`

Behavior:

- requires login
- loads the existing post
- only the author can edit
- unauthorized access is rejected

### Public Post Detail

- `/posts/[postId]`

Behavior:

- remains publicly readable
- keeps the existing comment behavior

## Data Model

No new models are required beyond the already-added `Post`, `Comment`, and `User.role`.

Relevant fields:

- `Post.id`
- `Post.title`
- `Post.content`
- `Post.authorId`
- `Post.createdAt`
- `Post.updatedAt`
- `User.role`

## Authorization Rules

- dashboard routes require login
- post creation requires login
- post editing is author-only
- post deletion is allowed for the author or an `ADMIN`
- public post detail remains accessible without login
- comment rules remain unchanged

## UI Structure

### Dashboard Page

Show:

- page heading
- `전체 글 / 내 글` tabs
- `새 글 작성` button
- latest-first post list
- post metadata such as author and created date
- edit/delete controls only when permitted

Each list item links to the existing public detail page.

### Create Page

Show:

- title input
- content textarea
- submit button
- validation error state

### Edit Page

Show:

- existing title/content values
- save button
- validation error state

## Query and Filtering Rules

- `scope=all` returns every post in newest-first order
- `scope=mine` returns only posts whose `authorId` matches the current user
- invalid `scope` values fall back to `all`

## Validation and Error Handling

Reject:

- empty title
- empty body
- create/update requests without session
- edit/delete requests for missing posts
- edit/delete requests without permission

Expected behavior:

- form pages show actionable validation errors
- delete revalidates dashboard and detail routes
- invalid `scope` never breaks the page; it quietly falls back to `all`

## Testing

At minimum, cover:

- `scope=all` and `scope=mine` branching
- fallback from invalid `scope` to `all`
- newest-first ordering
- post content validation
- author can edit
- non-author cannot edit
- author can delete
- admin can delete
- unauthorized non-admin cannot delete another user's post

## Implementation Notes

- extend `lib/posts.ts` with post listing and permission helpers
- add dedicated post server actions for create/update/delete
- keep dashboard rendering server-first
- keep authorization logic shared where possible so UI gating and server enforcement do not drift

## Open Decisions Resolved

- dashboard shows `전체 글 / 내 글` tabs, not search
- post creation uses a separate page at `/dashboard/posts/new`
- dashboard list order is newest first
- authors can edit and delete their own posts
- admins can delete any post
