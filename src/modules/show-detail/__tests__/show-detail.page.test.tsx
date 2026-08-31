import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { installTvmazeFetchMock, tvmazeTestLabels } from '@/__tests__/mock-tvmaze-fetch'
import { renderApp } from '@/__tests__/render-app'

describe('ShowDetailPage', () => {
  beforeEach(() => {
    installTvmazeFetchMock()
  })

  it('renders show details and grouped episodes', async () => {
    renderApp({ path: `/shows/${tvmazeTestLabels.detailShowId}` })

    expect(
      await screen.findByRole('heading', { name: tvmazeTestLabels.detailShowName }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Season 1' })).toBeInTheDocument()
    })

    expect(screen.getByText(/E1 — Pilot/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Season 2' })).toBeInTheDocument()
  })
})
