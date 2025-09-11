import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges conditional classes', () => {
    const out = cn('px-2', false && 'hidden', 'text-sm', 'px-4')
    // tailwind-merge should keep the latter px-4
    expect(out).toContain('px-4')
    expect(out).not.toContain('px-2')
    expect(out).toContain('text-sm')
  })
})

