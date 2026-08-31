import type { Show } from '../schemas/tvmaze.schema'

export const SHOW_ROW_SIZE = 12
const MIN_GENRE_ROW_SIZE = 4
const MAX_GENRE_ROWS = 8
const GENRE_ROW_SIZE = 18

export type ShowRow = {
  id: string
  title: string
  shows: Show[]
}

export function buildShowRows(
  shows: Show[],
  options: {
    featuredShowId?: number
    favoriteShows?: Show[]
  } = {},
): ShowRow[] {
  const rows: ShowRow[] = []
  const featuredShowId = options.featuredShowId
  const catalog: Show[] = []

  for (const show of shows) {
    if (show.id !== featuredShowId) {
      catalog.push(show)
    }
  }

  const favoriteShows = options.favoriteShows
  if (favoriteShows && favoriteShows.length > 0) {
    rows.push({
      id: 'my-list',
      title: 'My List',
      shows: favoriteShows,
    })
  }

  if (catalog.length === 0) {
    return rows
  }

  rows.push({
    id: 'next-watch',
    title: 'Your Next Watch',
    shows: catalog.slice(0, SHOW_ROW_SIZE),
  })

  const byGenre = new Map<string, Show[]>()
  for (const show of catalog) {
    for (const genre of show.genres ?? []) {
      const list = byGenre.get(genre) ?? []
      list.push(show)
      byGenre.set(genre, list)
    }
  }

  const genreRows = [...byGenre.entries()]
    .filter(([, list]) => list.length >= MIN_GENRE_ROW_SIZE)
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, MAX_GENRE_ROWS)

  for (const [genre, list] of genreRows) {
    rows.push({
      id: `genre-${genre}`,
      title: genre,
      shows: list.slice(0, GENRE_ROW_SIZE),
    })
  }

  return rows
}
