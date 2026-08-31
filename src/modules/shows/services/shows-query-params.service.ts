import { isStatusFilter, type StatusFilter } from '../types/show-status.type'

export type ShowsSearchParams = {
  searchQuery: string
  statusFilter: StatusFilter
}

export function parseShowsSearchParams(searchParams: URLSearchParams): ShowsSearchParams {
  const searchQuery = searchParams.get('q') ?? ''
  const rawStatus = searchParams.get('status') ?? 'all'

  return {
    searchQuery,
    statusFilter: isStatusFilter(rawStatus) ? rawStatus : 'all',
  }
}

export function serializeShowsSearchParams(
  searchQuery: string,
  statusFilter: StatusFilter,
): URLSearchParams {
  const params = new URLSearchParams()
  const trimmedQuery = searchQuery.trim()

  if (trimmedQuery.length > 0) {
    params.set('q', trimmedQuery)
  }

  if (statusFilter !== 'all') {
    params.set('status', statusFilter)
  }

  return params
}
