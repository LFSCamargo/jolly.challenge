import type { Show } from '../schemas/tvmaze.schema'
import type { StatusFilter } from '../types/show-status.type'

export function showMatchesSearchQuery(show: Show, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return false
  }

  const haystack = [show.name, ...(show.genres ?? []), show.summary ?? '']
    .join(' ')
    .toLowerCase()

  return haystack.includes(needle)
}

export function filterShowsByStatus(shows: Show[], status: StatusFilter): Show[] {
  if (status === 'all') {
    return shows
  }

  return shows.filter((show) => show.status === status)
}
