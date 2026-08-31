import { describe, expect, it, vi } from 'vitest'
import { isDesktopViewport, isMobileViewport } from '@/common/utils/viewport'

describe('viewport utils', () => {
  it('defaults to desktop when matchMedia is unavailable', () => {
    const original = window.matchMedia
    // @ts-expect-error test override
    delete window.matchMedia

    expect(isDesktopViewport()).toBe(true)
    expect(isMobileViewport()).toBe(false)

    window.matchMedia = original
  })

  it('reads mobile and desktop media queries when available', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('max-width: 767px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )

    expect(isMobileViewport()).toBe(true)
    expect(isDesktopViewport()).toBe(false)

    vi.unstubAllGlobals()
  })
})
