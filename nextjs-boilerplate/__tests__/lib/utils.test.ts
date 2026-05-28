import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })
  it('ignores falsy conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })
  it('resolves tailwind conflicts — last class wins', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})
