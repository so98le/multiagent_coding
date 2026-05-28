# multiagent_coding

This repository is a study workspace. The main app currently lives in `nextjs-boilerplate/`.

## Project Overview

`nextjs-boilerplate/` is a Next.js App Router application with:

- Auth.js v5 with Google OAuth
- Prisma with PostgreSQL
- Tailwind CSS and shadcn/ui
- Vitest for unit tests

The current product shape is a simple community-style app:

- authenticated dashboard
- dashboard post management
- public post detail pages
- logged-in comments on post detail pages

## Current Features

### Authentication

- Google login
- authenticated dashboard routes
- public post detail routes at `/posts/[postId]`

### Post Management

- dashboard list at `/dashboard`
- scope tabs:
  - `/dashboard?scope=all`
  - `/dashboard?scope=mine`
- newest-first post ordering
- create page at `/dashboard/posts/new`
- edit page at `/dashboard/posts/[postId]/edit`
- author can edit and delete their own posts
- admin can delete any post

### Comments

- one-level comments only
- comments on `/posts/[postId]`
- logged-in users can create comments
- comments are visible immediately
- comment author can delete their own comments
- admin can delete any comment

## Directory Layout

```text
multiagent_coding/
├─ docs/
│  └─ superpowers/
│     ├─ plans/
│     └─ specs/
├─ nextjs-boilerplate/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  ├─ prisma/
│  ├─ public/
│  └─ __tests__/
└─ README.md
```

## Key Routes

- `/login` - Google sign-in
- `/dashboard` - authenticated dashboard with post list
- `/dashboard?scope=all` - all posts
- `/dashboard?scope=mine` - only the signed-in user's posts
- `/dashboard/posts/new` - create post
- `/dashboard/posts/[postId]/edit` - edit post
- `/posts/[postId]` - public post detail with comments

## Data Model

The main Prisma models are:

- `User`
  - includes `role: USER | ADMIN`
- `Post`
  - title, content, author, timestamps
- `Comment`
  - one-level comment tied to a post
  - soft delete via `deletedAt`

## Setup

### 1. Install dependencies

```bash
cd nextjs-boilerplate
npm install
```

### 2. Configure environment variables

Use `nextjs-boilerplate/.env.example` as the reference and create `nextjs-boilerplate/.env.local`.

Required values:

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
```

Google OAuth redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

### 3. Apply Prisma schema

```bash
npm run db:push
```

If needed, regenerate Prisma Client:

```bash
npm run db:generate
```

### 4. Start the dev server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Scripts

Run from `nextjs-boilerplate/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run db:push
npm run db:migrate
npm run db:studio
```

## Manual Verification

Because there is no seeded data flow in this repository yet, the easiest way to test locally is with Prisma Studio.

### Prepare test data

1. Run:

```bash
npm run db:studio
```

2. Make sure you have:

- a `User`
- optionally an `ADMIN` user for permission checks
- at least one `Post`

### Verify dashboard post management

After logging in:

- open `/dashboard?scope=all`
- confirm all posts are listed newest first
- open `/dashboard?scope=mine`
- confirm only your posts are listed
- create a post at `/dashboard/posts/new`
- edit a post at `/dashboard/posts/[postId]/edit`
- confirm the author can delete their own post
- confirm an admin can delete another user's post

### Verify comments

Open `/posts/<postId>` and check:

- signed-out users can read the page
- signed-out users see the login prompt instead of the comment form
- signed-in users can add comments
- comments appear oldest first
- comment author can delete their own comment
- admin can delete any comment

## Automated Verification

Run:

```bash
npm test
npx eslint .
npx tsc --noEmit --pretty false
```

## Current Limitations

- no post search
- no pagination
- no post categories
- no rich text editor
- no comment editing
- no nested comments
- no dedicated admin moderation UI
- no end-to-end browser test coverage yet

## Design and Plan Docs

- `docs/superpowers/specs/2026-05-28-post-comments-design.md`
- `docs/superpowers/plans/2026-05-28-post-comments.md`
- `docs/superpowers/specs/2026-05-28-dashboard-post-management-design.md`
- `docs/superpowers/plans/2026-05-28-dashboard-post-management.md`
