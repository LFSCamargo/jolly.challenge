import { fireEvent, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installTvmazeFetchMock, tvmazeTestLabels } from '@/__tests__/mock-tvmaze-fetch'
import { renderApp } from '@/__tests__/render-app'
import { createAppQueryClient } from '@/lib/query-client'
import { appRoutes } from '@/routes'

describe('ShowsPage', () => {
  beforeEach(() => {
    installTvmazeFetchMock()
  })

  it('renders a featured hero and a Your Next Watch row', async () => {
    renderApp({ path: '/' })

    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your Next Watch' })).toBeInTheDocument()
    expect(screen.getAllByText(tvmazeTestLabels.endedShowName).length).toBeGreaterThan(0)
  })

  it('searches by name after typing', async () => {
    renderApp({ path: '/' })

    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search shows'), {
      target: { value: tvmazeTestLabels.searchQuery },
    })

    await waitFor(() => {
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

  it('filters the browse list by status', async () => {
    renderApp({ path: '/' })

    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Running$/ }))

    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.runningShowName,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: tvmazeTestLabels.featuredShowName }),
    ).not.toBeInTheDocument()
  })

  it('initializes search and filter from query string params', async () => {
    renderApp({
      path: `/?q=${tvmazeTestLabels.searchQuery}&status=Running`,
    })

    expect(screen.getByLabelText('Search shows')).toHaveValue(tvmazeTestLabels.searchQuery)

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/search/shows?q=${tvmazeTestLabels.searchQuery}`),
        expect.any(Object),
      )
    })

    expect(await screen.findByRole('button', { name: 'Running', pressed: true })).toBeInTheDocument()
  })

  it('updates query string params when filtering', async () => {
    const { router } = renderApp({ path: '/' })

    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Ended$/ }))

    await waitFor(() => {
      expect(router.state.location.search).toBe('?status=Ended')
    })
  })

  it('updates query string params when searching', async () => {
    const { router } = renderApp({ path: '/' })

    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search shows'), {
      target: { value: tvmazeTestLabels.searchQuery },
    })

    await waitFor(() => {
      expect(router.state.location.search).toBe(`?q=${tvmazeTestLabels.searchQuery}`)
    })
  })

  it('does not request the browse list again while the cache is under one minute', async () => {
    const queryClient = createAppQueryClient()
    const fetchMock = vi.mocked(globalThis.fetch)

    function renderWithCache() {
      const router = createMemoryRouter(appRoutes, { initialEntries: ['/'] })
      return render(
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>,
      )
    }

    const firstView = renderWithCache()
    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()
    const callsAfterFirstLoad = fetchMock.mock.calls.length
    firstView.unmount()

    renderWithCache()
    expect(
      await screen.findByRole('heading', {
        name: tvmazeTestLabels.featuredShowName,
      }),
    ).toBeInTheDocument()
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirstLoad)
  })
})
