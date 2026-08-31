import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { filterShowsByStatus } from '../services/filter-shows.service'
import { fetchShowsPage, searchShows } from '../services/tvmaze.service'
import type { StatusFilter } from '../types/show-status.type'
import { useDebouncedValue } from './use-debounced-value'

export function useShowsList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const debouncedQuery = useDebouncedValue(searchQuery.trim())
  const isSearchActive = debouncedQuery.length > 0

  const browseQuery = useInfiniteQuery({
    queryKey: ['shows', 'list'],
    queryFn: ({ pageParam, signal }) => fetchShowsPage(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + 1,
    enabled: !isSearchActive,
  })

  const searchQueryResult = useQuery({
    queryKey: ['shows', 'search', debouncedQuery],
    queryFn: ({ signal }) => searchShows(debouncedQuery, signal),
    enabled: isSearchActive,
  })

  const sourceShows = useMemo(() => {
    if (isSearchActive) {
      return searchQueryResult.data ?? []
    }

    return browseQuery.data?.pages.flat() ?? []
  }, [browseQuery.data?.pages, isSearchActive, searchQueryResult.data])

  const shows = useMemo(
    () => filterShowsByStatus(sourceShows, statusFilter),
    [sourceShows, statusFilter],
  )

  const isInitialLoading = isSearchActive
    ? searchQueryResult.isPending && !searchQueryResult.data
    : browseQuery.isPending && !browseQuery.data

  const isUpdating = isSearchActive
    ? searchQueryResult.isFetching && Boolean(searchQueryResult.data)
    : browseQuery.isFetchingNextPage

  const isError = isSearchActive ? searchQueryResult.isError : browseQuery.isError

  const error = isSearchActive ? searchQueryResult.error : browseQuery.error

  const refetch = isSearchActive ? searchQueryResult.refetch : browseQuery.refetch

  const hasNextPage = !isSearchActive && Boolean(browseQuery.hasNextPage)
  const isFetchingNextPage = browseQuery.isFetchingNextPage

  return {
    shows,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isSearchActive,
    isInitialLoading,
    isUpdating,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage: browseQuery.fetchNextPage,
    isFetchingNextPage,
    isEmpty: !isInitialLoading && !isError && shows.length === 0,
  }
}
