import type { Show } from '../schemas/tvmaze.schema'

export const SHOW_ROW_SIZE = 12

export type ShowRow = {
  id: string
  title: string
  shows: Show[]
}

export function buildShowRows(
  shows: Show[],
  options: {
    featuredShowId?: number
  } = {},
): ShowRow[] {
  const featuredShowId = options.featuredShowId
  const catalog: Show[] = []

  for (const show of shows) {
    if (show.id !== featuredShowId) {
      catalog.push(show)
    }
  }

  const rows: ShowRow[] = []

  for (let start = 0; start < catalog.length; start += SHOW_ROW_SIZE) {
    const chunk = catalog.slice(start, start + SHOW_ROW_SIZE)
    const fallbackTitle = start === 0 ? 'Your Next Watch' : 'More Shows'

    rows.push({
      id: `row-${start}`,
      title: start === 0 ? 'Your Next Watch' : (chunk[0]?.genres?.[0] ?? fallbackTitle),
      shows: chunk,
    })
  }

  return rows
}
