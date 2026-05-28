import { describe, expect, it } from 'vitest'

import {
  canDeleteComment,
  COMMENT_MAX_LENGTH,
  COMMENT_TOO_LONG_ERROR,
  EMPTY_COMMENT_ERROR,
  validateCommentContent,
} from '@/lib/comments'

describe('validateCommentContent', () => {
  it('rejects empty content after trimming', () => {
    expect(() => validateCommentContent('   \n\t  ')).toThrowError(EMPTY_COMMENT_ERROR)
  })

  it('rejects content over the maximum length', () => {
    expect(() => validateCommentContent('a'.repeat(COMMENT_MAX_LENGTH + 1))).toThrowError(
      COMMENT_TOO_LONG_ERROR,
    )
  })

  it('returns trimmed valid content', () => {
    expect(validateCommentContent('  hello world  ')).toBe('hello world')
  })
})

describe('canDeleteComment', () => {
  it('allows the comment author to delete', () => {
    expect(
      canDeleteComment({
        actorId: 'user-1',
        actorRole: 'USER',
        commentAuthorId: 'user-1',
      }),
    ).toBe(true)
  })

  it('allows an admin to delete', () => {
    expect(
      canDeleteComment({
        actorId: 'admin-1',
        actorRole: 'ADMIN',
        commentAuthorId: 'user-1',
      }),
    ).toBe(true)
  })

  it('denies other users', () => {
    expect(
      canDeleteComment({
        actorId: 'user-2',
        actorRole: 'USER',
        commentAuthorId: 'user-1',
      }),
    ).toBe(false)
  })
})
