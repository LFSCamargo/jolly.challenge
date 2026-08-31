import { describe, expect, it } from 'vitest'
import { stripHtml } from '@/lib/strip-html'

describe('stripHtml', () => {
  it('removes html tags from summaries', () => {
    expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })
})
