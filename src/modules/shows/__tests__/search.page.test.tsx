import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installTvmazeFetchMock, tvmazeTestLabels } from '@/__tests__/mock-tvmaze-fetch'
import { renderApp } from '@/__tests__/render-app'

describe('SearchPage', () => {
  beforeEach(() => {
    installTvmazeFetchMock()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('max-width: 767px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('provides a dedicated search experience and syncs the query string', async () => {
    const { router } = renderApp({ path: '/search' })

    expect(screen.getByRole('heading', { name: 'Search shows' })).toBeInTheDocument()

    const searchInput = screen.getByLabelText('Search shows')
    expect(searchInput).toHaveFocus()

    fireEvent.change(searchInput, {
      target: { value: tvmazeTestLabels.searchQuery },
    })

    await waitFor(() => {
      expect(router.state.location.search).toBe(`?q=${tvmazeTestLabels.searchQuery}`)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/search/shows?q=${tvmazeTestLabels.searchQuery}`),
        expect.any(Object),
      )
    })

    expect(
      await screen.findByRole('heading', { name: 'Search Results' }),
    ).toBeInTheDocument()
    expect(screen.getByText(tvmazeTestLabels.searchTopResultName)).toBeInTheDocument()
  })

  it('fetches the next catalog page when the search sentinel is visible', async () => {
    let intersect: (() => void) | undefined

    class ControlledIntersectionObserver {
      observe = vi.fn((target: Element) => {
        intersect = () => {
          this.callback(
            [{ isIntersecting: true, target } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
          )
        }
      })
      unobserve = vi.fn()
      disconnect = vi.fn()

      constructor(private readonly callback: IntersectionObserverCallback) {}
    }

    vi.stubGlobal('IntersectionObserver', ControlledIntersectionObserver)

    renderApp({
      path: `/search?q=${tvmazeTestLabels.searchQuery}`,
    })

    expect(
      await screen.findByRole('heading', { name: 'Search Results' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(intersect).toBeDefined()
    })

    act(() => {
      intersect?.()
    })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shows?page=1'),
        expect.any(Object),
      )
    })
  })

  it('restores search and status from the URL', async () => {
    renderApp({
      path: `/search?q=${tvmazeTestLabels.searchQuery}&status=Ended`,
    })

    expect(screen.getByLabelText('Search shows')).toHaveValue(
      tvmazeTestLabels.searchQuery,
    )
    expect(
      await screen.findByRole('button', { name: 'Ended', pressed: true }),
    ).toBeInTheDocument()
  })
})
