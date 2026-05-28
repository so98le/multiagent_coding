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

import { getPostDetail, shapeVisibleComments } from '@/lib/posts'

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
