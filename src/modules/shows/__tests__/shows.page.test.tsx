import { fireEvent, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/__tests__/render-app'
import { createAppQueryClient } from '@/lib/query-client'
import { appRoutes } from '@/routes'
import {
  mockEndedShow,
  mockSearchPayload,
  mockShow,
} from '@/modules/shows/__tests__/fixtures/shows.fixture'

describe('ShowsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)

      if (url.includes('/search/shows')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockSearchPayload), { status: 200 }),
        )
      }

      return Promise.resolve(
        new Response(JSON.stringify([mockShow, mockEndedShow]), { status: 200 }),
      )
    })
  })

  it('renders a featured hero and a Your Next Watch row', async () => {
    renderApp({ path: '/' })

    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your Next Watch' })).toBeInTheDocument()
    expect(screen.getByText('Ended Show')).toBeInTheDocument()
  })

  it('searches by name after typing', async () => {
    renderApp({ path: '/' })

    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search shows'), { target: { value: 'mock' } })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search/shows?q=mock'),
        expect.any(Object),
      )
    })

    expect(
      await screen.findByRole('heading', { name: 'Search Results' }),
    ).toBeInTheDocument()
  })

  it('filters the browse list by status', async () => {
    renderApp({ path: '/' })

    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ended' }))

    expect(await screen.findByRole('heading', { name: 'Ended Show' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Mock Show' })).not.toBeInTheDocument()
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
    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()
    const callsAfterFirstLoad = fetchMock.mock.calls.length
    firstView.unmount()

    renderWithCache()
    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirstLoad)
  })
})
