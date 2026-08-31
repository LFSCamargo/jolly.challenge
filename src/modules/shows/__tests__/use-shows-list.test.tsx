import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { installTvmazeFetchMock, tvmazeTestLabels } from '@/__tests__/mock-tvmaze-fetch'
import { createAppQueryClient } from '@/lib/query-client'
import { useShowsList } from '../hooks/use-shows-list'

function SearchListHarness() {
  const navigate = useNavigate()
  const { shows, hasNextPage, fetchNextPage, searchQuery } = useShowsList({
    browseEnabled: false,
  })

  return (
    <div>
      <span data-testid="query">{searchQuery}</span>
      <span data-testid="count">{shows.length}</span>
      <span data-testid="has-next">{String(hasNextPage)}</span>
      <button type="button" onClick={() => void fetchNextPage()}>
        Load more
      </button>
      <button
        type="button"
        onClick={() => {
          void navigate('/search?q=breaking')
        }}
      >
        External update
      </button>
    </div>
  )
}

function renderSearchHarness(initialPath: string) {
  const queryClient = createAppQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/search" element={<SearchListHarness />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('useShowsList', () => {
  beforeEach(() => {
    installTvmazeFetchMock()
  })

  it('adopts URL query updates from external navigation without clobbering them', async () => {
    renderSearchHarness('/search?q=br')

    await waitFor(() => {
      expect(screen.getByTestId('query')).toHaveTextContent('br')
    })

    await act(async () => {
      screen.getByRole('button', { name: 'External update' }).click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('query')).toHaveTextContent('breaking')
    })
  })

  it('loads more catalog pages while searching', async () => {
    renderSearchHarness(`/search?q=${tvmazeTestLabels.searchQuery}`)

    await waitFor(() => {
      expect(Number(screen.getByTestId('count').textContent)).toBeGreaterThan(0)
      expect(screen.getByTestId('has-next')).toHaveTextContent('true')
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shows?page=0'),
        expect.any(Object),
      )
    })

    await act(async () => {
      screen.getByRole('button', { name: 'Load more' }).click()
    })

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shows?page=1'),
        expect.any(Object),
      )
    })
  })
})
