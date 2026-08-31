import type { Show } from '../schemas/tvmaze.schema'

export const SHOW_ROW_SIZE = 12

export type BrowseSections = {
  nextWatch: Show[]
  remaining: Show[]
}

export function buildBrowseSections(
  shows: Show[],
  options: {
    featuredShowId?: number
  } = {},
): BrowseSections {
  const featuredShowId = options.featuredShowId
  const catalog: Show[] = []

  for (const show of shows) {
    if (show.id !== featuredShowId) {
      catalog.push(show)
    }
  }

  return {
    nextWatch: catalog.slice(0, SHOW_ROW_SIZE),
    remaining: catalog.slice(SHOW_ROW_SIZE),
  }
}
