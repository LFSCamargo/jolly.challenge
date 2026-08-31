import type { Show } from '../schemas/tvmaze.schema'
import type { StatusFilter } from '../types/show-status.type'

export function filterShowsByStatus(shows: Show[], status: StatusFilter): Show[] {
  if (status === 'all') {
    return shows
  }

  return shows.filter((show) => show.status === status)
}
