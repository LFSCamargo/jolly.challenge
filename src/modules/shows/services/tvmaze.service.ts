import { env } from '@/lib/env'
import {
  episodesSchema,
  searchResultsSchema,
  showSchema,
  showsPageSchema,
  type Episode,
  type Show,
} from '../schemas/tvmaze.schema'

class TvmazeRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'TvmazeRequestError'
  }
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (env.apiKey) {
    headers.Authorization = `Bearer ${env.apiKey}`
  }

  return headers
}

async function tvmazeFetch<T>(
  path: string,
  signal: AbortSignal | undefined,
  parse: (json: unknown) => T,
): Promise<T> {
  const response = await fetch(`${env.tvmazeBaseUrl}${path}`, {
    signal,
    headers: buildHeaders(),
  })

  if (!response.ok) {
    throw new TvmazeRequestError(
      `TVMaze request failed (${response.status})`,
      response.status,
    )
  }

  const json: unknown = await response.json()
  return parse(json)
}

function parseShowsPage(json: unknown): Show[] {
  const parsed = showsPageSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error('Invalid shows page payload')
  }

  return parsed.data
}

function parseSearchResults(json: unknown): Show[] {
  const parsed = searchResultsSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error('Invalid search payload')
  }

  return parsed.data.map((result) => result.show)
}

function parseShow(json: unknown): Show {
  const parsed = showSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error('Invalid show payload')
  }

  return parsed.data
}

function parseEpisodes(json: unknown): Episode[] {
  const parsed = episodesSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error('Invalid episodes payload')
  }

  return parsed.data
}

export function fetchShowsPage(page: number, signal?: AbortSignal): Promise<Show[]> {
  return tvmazeFetch(`/shows?page=${page}`, signal, parseShowsPage)
}

export function searchShows(query: string, signal?: AbortSignal): Promise<Show[]> {
  const encodedQuery = encodeURIComponent(query)
  return tvmazeFetch(`/search/shows?q=${encodedQuery}`, signal, parseSearchResults)
}

export function fetchShow(showId: number, signal?: AbortSignal): Promise<Show> {
  return tvmazeFetch(`/shows/${showId}`, signal, parseShow)
}

export function fetchEpisodes(showId: number, signal?: AbortSignal): Promise<Episode[]> {
  return tvmazeFetch(`/shows/${showId}/episodes`, signal, parseEpisodes)
}

export function getShowListImage(show: Show): string | null {
  return show.image?.medium ?? null
}

export function getShowDetailImage(show: Show): string | null {
  return show.image?.original ?? show.image?.medium ?? null
}
