import { beforeEach, describe, expect, it, vi } from 'vitest'

const findUnique = vi.fn()

vi.mock('react', () => ({
  cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}))

vi.mock('@/lib/db', () => ({
  getDb: () => ({
    post: {
      findUnique,
    },
  }),
}))

import {
  canDeletePost,
  canEditPost,
  EMPTY_POST_CONTENT_ERROR,
  EMPTY_POST_TITLE_ERROR,
  getPostDetail,
  normalizePostScope,
  shapeVisibleComments,
  sortPostsNewestFirst,
  validatePostContent,
  validatePostTitle,
} from '@/lib/posts'

describe('shapeVisibleComments', () => {
  it('removes soft-deleted comments and sorts visible comments oldest first', () => {
    const visibleNewest = {
      id: 'comment-3',
      content: 'Newest visible',
      createdAt: new Date('2026-05-03T00:00:00.000Z'),
      deletedAt: null,
      author: { id: 'user-3', name: 'User 3' },
    }
    const deletedMiddle = {
      id: 'comment-2',
      content: 'Deleted comment',
      createdAt: new Date('2026-05-02T00:00:00.000Z'),
      deletedAt: new Date('2026-05-04T00:00:00.000Z'),
      author: { id: 'user-2', name: 'User 2' },
    }
    const visibleOldest = {
      id: 'comment-1',
      content: 'Oldest visible',
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      deletedAt: null,
      author: { id: 'user-1', name: 'User 1' },
    }

    expect(shapeVisibleComments([visibleNewest, deletedMiddle, visibleOldest])).toEqual([
      visibleOldest,
      visibleNewest,
    ])
  })
})

describe('normalizePostScope', () => {
  it('falls back to all for missing or invalid scope values', () => {
    expect(normalizePostScope(undefined)).toBe('all')
    expect(normalizePostScope(null)).toBe('all')
    expect(normalizePostScope('ALL')).toBe('all')
    expect(normalizePostScope('mine ')).toBe('all')
    expect(normalizePostScope('something-else')).toBe('all')
  })

  it('returns mine only for the exact valid scope value', () => {
    expect(normalizePostScope('mine')).toBe('mine')
  })
})

describe('sortPostsNewestFirst', () => {
  it('sorts posts by createdAt descending', () => {
    const oldest = { id: 'post-1', createdAt: new Date('2026-05-01T00:00:00.000Z') }
    const middle = { id: 'post-2', createdAt: new Date('2026-05-02T00:00:00.000Z') }
    const newest = { id: 'post-3', createdAt: new Date('2026-05-03T00:00:00.000Z') }

    expect(sortPostsNewestFirst([middle, oldest, newest])).toEqual([newest, middle, oldest])
  })
})

describe('post validation', () => {
  it('rejects an empty title after trimming', () => {
    expect(() => validatePostTitle('   ')).toThrowError(EMPTY_POST_TITLE_ERROR)
  })

  it('rejects an empty body after trimming', () => {
    expect(() => validatePostContent('\n\t  ')).toThrowError(EMPTY_POST_CONTENT_ERROR)
  })

  it('returns trimmed title and content for valid inputs', () => {
    expect(validatePostTitle('  Title  ')).toBe('Title')
    expect(validatePostContent('  Body  ')).toBe('Body')
  })
})

describe('canEditPost', () => {
  it('allows authors to edit their own posts', () => {
    expect(canEditPost({ actorId: 'author-1', postAuthorId: 'author-1' })).toBe(true)
  })

  it('denies post edits for non-authors', () => {
    expect(canEditPost({ actorId: 'user-2', postAuthorId: 'author-1' })).toBe(false)
  })
})

describe('canDeletePost', () => {
  it('allows authors to delete their own posts', () => {
    expect(
      canDeletePost({
        actorId: 'author-1',
        actorRole: 'USER',
        postAuthorId: 'author-1',
      }),
    ).toBe(true)
  })

  it('allows admins to delete any post', () => {
    expect(
      canDeletePost({
        actorId: 'admin-1',
        actorRole: 'ADMIN',
        postAuthorId: 'author-1',
      }),
    ).toBe(true)
  })

  it('denies deletes for unrelated non-admin users', () => {
    expect(
      canDeletePost({
        actorId: 'user-2',
        actorRole: 'USER',
        postAuthorId: 'author-1',
      }),
    ).toBe(false)
  })
})

describe('getPostDetail', () => {
  beforeEach(() => {
    findUnique.mockReset()
  })

  it('returns null when the post does not exist', async () => {
    findUnique.mockResolvedValue(null)

    await expect(getPostDetail('missing-post')).resolves.toBeNull()
  })

  it('returns the post with soft-deleted comments removed and visible comments sorted oldest first', async () => {
    const visibleNewest = {
      id: 'comment-3',
      content: 'Newest visible',
      createdAt: new Date('2026-05-03T00:00:00.000Z'),
      deletedAt: null,
      author: { id: 'user-3', name: 'User 3' },
    }
    const deletedMiddle = {
      id: 'comment-2',
      content: 'Deleted comment',
      createdAt: new Date('2026-05-02T00:00:00.000Z'),
      deletedAt: new Date('2026-05-04T00:00:00.000Z'),
      author: { id: 'user-2', name: 'User 2' },
    }
    const visibleOldest = {
      id: 'comment-1',
      content: 'Oldest visible',
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      deletedAt: null,
      author: { id: 'user-1', name: 'User 1' },
    }

    findUnique.mockResolvedValue({
      id: 'post-1',
      title: 'Post title',
      content: 'Post content',
      author: { id: 'author-1', name: 'Author' },
      comments: [visibleNewest, deletedMiddle, visibleOldest],
    })

    await expect(getPostDetail('post-1')).resolves.toEqual({
      id: 'post-1',
      title: 'Post title',
      content: 'Post content',
      author: { id: 'author-1', name: 'Author' },
      comments: [visibleOldest, visibleNewest],
    })

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      include: {
        author: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    })
  })
})
