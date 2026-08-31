import { beforeEach, describe, expect, it } from 'vitest'
import { installTvmazeFetchMock } from '@/__tests__/mock-tvmaze-fetch'
import { tvmazeMockData, tvmazeTestLabels } from '@test-fixtures/tvmaze.mock-data'
import {
  fetchEpisodes,
  fetchShow,
  fetchShowsPage,
  searchShows,
} from '../services/tvmaze.service'

describe('tvmaze.service', () => {
  beforeEach(() => {
    installTvmazeFetchMock()
  })

  it('fetches and parses a real shows page snapshot', async () => {
    const shows = await fetchShowsPage(0)
    expect(shows).toHaveLength(tvmazeTestLabels.browsePageSize)
    expect(shows[0]?.name).toBe(tvmazeTestLabels.featuredShowName)
  })

  it('fetches additional browse pages for pagination', async () => {
    const page1 = await fetchShowsPage(1)
    expect(page1).toHaveLength(tvmazeMockData.browsePages[1].length)
  })

  it('normalizes search results to shows', async () => {
    const shows = await searchShows(tvmazeTestLabels.searchQuery)
    expect(shows[0]?.name).toBe(tvmazeTestLabels.searchTopResultName)
  })

  it('fetches a show and episodes from captured detail fixtures', async () => {
    const show = await fetchShow(tvmazeTestLabels.detailShowId)
    const episodes = await fetchEpisodes(tvmazeTestLabels.detailShowId)

    expect(show.name).toBe(tvmazeTestLabels.detailShowName)
    expect(episodes.length).toBeGreaterThan(0)
  })

  it('passes abort signals to fetch', async () => {
    const controller = new AbortController()
    await fetchShowsPage(0, controller.signal)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/shows?page=0'),
      expect.objectContaining({ signal: controller.signal }),
    )
  })
})
