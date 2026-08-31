import { describe, expect, it } from 'vitest'
import { resolveTvmazeMockResponse } from './tvmaze-mock-handler'
import { tvmazeMockData, tvmazeTestLabels } from './tvmaze.mock-data'

describe('tvmaze mock handler', () => {
  it('serves paginated browse pages from captured TVMaze data', () => {
    const page0 = resolveTvmazeMockResponse('https://api.tvmaze.com/shows?page=0')
    const page1 = resolveTvmazeMockResponse('https://api.tvmaze.com/shows?page=1')
    const page99 = resolveTvmazeMockResponse('https://api.tvmaze.com/shows?page=99')

    expect(page0?.body).toEqual(tvmazeMockData.browsePages[0])
    expect(page1?.body).toEqual(tvmazeMockData.browsePages[1])
    expect(page99).toEqual({ status: 404, body: { message: 'Not Found' } })
    expect(tvmazeMockData.browsePages[0]).toHaveLength(tvmazeTestLabels.browsePageSize)
  })

  it('serves search results for known queries', () => {
    const breaking = resolveTvmazeMockResponse(
      'https://api.tvmaze.com/search/shows?q=breaking',
    )
    const empty = resolveTvmazeMockResponse(
      'https://api.tvmaze.com/search/shows?q=zzzzno-match-xyz',
    )

    expect(breaking?.body).toEqual(tvmazeMockData.search.breaking)
    expect(empty?.body).toEqual([])
  })

  it('serves show detail and episodes by id', () => {
    const show = resolveTvmazeMockResponse('https://api.tvmaze.com/shows/169')
    const episodes = resolveTvmazeMockResponse('https://api.tvmaze.com/shows/169/episodes')

    expect(show?.body).toEqual(tvmazeMockData.shows[169])
    expect(episodes?.body).toEqual(tvmazeMockData.episodes[169])
  })
})
