import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchEpisodes,
  fetchShow,
  fetchShowsPage,
  searchShows,
} from '../services/tvmaze.service'
import { mockEpisodes, mockSearchPayload, mockShow } from './fixtures/shows.fixture'

describe('tvmaze.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and parses a shows page', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([mockShow]), { status: 200 }),
    )

    await expect(fetchShowsPage(0)).resolves.toEqual([mockShow])
  })

  it('normalizes search results to shows', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockSearchPayload), { status: 200 }),
    )

    await expect(searchShows('mock')).resolves.toEqual([mockShow])
  })

  it('fetches a show and episodes', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockShow), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockEpisodes), { status: 200 }))

    await expect(fetchShow(1)).resolves.toEqual(mockShow)
    await expect(fetchEpisodes(1)).resolves.toEqual(mockEpisodes)
  })

  it('passes abort signals to fetch', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    const controller = new AbortController()

    await fetchShowsPage(0, controller.signal)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shows?page=0'),
      expect.objectContaining({ signal: controller.signal }),
    )
  })
})
