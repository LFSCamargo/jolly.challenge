import { tvmazeMockData } from './tvmaze.mock-data'

type MockResponse = {
  status: number
  body: unknown
}

function getBrowsePage(page: number) {
  const key = String(page) as keyof typeof tvmazeMockData.browsePages
  return tvmazeMockData.browsePages[key] ?? []
}

function getSearchResults(query: string) {
  const normalized = query.trim().toLowerCase()

  if (normalized.length === 0) {
    return []
  }

  if (normalized.includes('breaking')) {
    return tvmazeMockData.search.breaking
  }

  if (normalized.includes('girl')) {
    return tvmazeMockData.search.girls
  }

  if (normalized.includes('no-match') || normalized.includes('zzzz')) {
    return tvmazeMockData.search.empty
  }

  return tvmazeMockData.search.breaking.filter((result) =>
    result.show.name.toLowerCase().includes(normalized),
  )
}

function getShow(showId: number) {
  const key = String(showId) as keyof typeof tvmazeMockData.shows
  return tvmazeMockData.shows[key] ?? null
}

function getEpisodes(showId: number) {
  const key = String(showId) as keyof typeof tvmazeMockData.episodes
  return tvmazeMockData.episodes[key] ?? []
}

export function resolveTvmazeMockResponse(url: string): MockResponse | null {
  if (!url.includes('api.tvmaze.com')) {
    return null
  }

  const searchMatch = url.match(/\/search\/shows\?q=([^&]+)/)
  if (searchMatch) {
    const query = decodeURIComponent(searchMatch[1] ?? '')
    return { status: 200, body: getSearchResults(query) }
  }

  const browseMatch = url.match(/\/shows\?page=(\d+)/)
  if (browseMatch) {
    const page = Number.parseInt(browseMatch[1] ?? '0', 10)
    return { status: 200, body: getBrowsePage(page) }
  }

  const episodesMatch = url.match(/\/shows\/(\d+)\/episodes$/)
  if (episodesMatch) {
    const showId = Number.parseInt(episodesMatch[1] ?? '0', 10)
    return { status: 200, body: getEpisodes(showId) }
  }

  const showMatch = url.match(/\/shows\/(\d+)$/)
  if (showMatch) {
    const showId = Number.parseInt(showMatch[1] ?? '0', 10)
    const show = getShow(showId)

    if (!show) {
      return { status: 404, body: { message: 'Not found' } }
    }

    return { status: 200, body: show }
  }

  return null
}

export function createTvmazeFetchMock() {
  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input)
    const mock = resolveTvmazeMockResponse(url)

    if (!mock) {
      return Promise.resolve(new Response('Not mocked', { status: 501 }))
    }

    return Promise.resolve(
      new Response(JSON.stringify(mock.body), {
        status: mock.status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  }
}

export async function fulfillTvmazeMockRoute(url: string) {
  const mock = resolveTvmazeMockResponse(url)

  if (!mock) {
    return null
  }

  return {
    status: mock.status,
    contentType: 'application/json',
    body: JSON.stringify(mock.body),
  }
}
