import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/__tests__/render-app'
import { mockEpisodes, mockShow } from '@/modules/shows/__tests__/fixtures/shows.fixture'

describe('ShowDetailPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)

      if (url.endsWith('/episodes')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockEpisodes), { status: 200 }),
        )
      }

      return Promise.resolve(new Response(JSON.stringify(mockShow), { status: 200 }))
    })
  })

  it('renders show details and grouped episodes', async () => {
    renderApp({ path: '/shows/1' })

    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()
    expect(screen.getByText('A mock summary.')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Season 1' })).toBeInTheDocument()
    })

    expect(screen.getByText(/E1 — Pilot/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Season 2' })).toBeInTheDocument()
  })
})
