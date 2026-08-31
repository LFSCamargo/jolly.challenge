import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filterShowsByStatus } from '../services/filter-shows.service'
import {
  parseShowsSearchParams,
  serializeShowsSearchParams,
} from '../services/shows-query-params.service'
import {
  fetchShowsPage,
  isTvmazeRateLimitError,
  searchShows,
} from '../services/tvmaze.service'
import type { StatusFilter } from '../types/show-status.type'
import { useDebouncedValue } from './use-debounced-value'

export function useShowsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialParams = parseShowsSearchParams(searchParams)
  const lastSyncedSearchRef = useRef(searchParams.toString())

  const [searchQuery, setSearchQueryState] = useState(initialParams.searchQuery)
  const [statusFilter, setStatusFilterState] = useState<StatusFilter>(
    initialParams.statusFilter,
  )
  const debouncedQuery = useDebouncedValue(searchQuery.trim())
  const isSearchActive = debouncedQuery.length > 0
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    const nextParams = serializeShowsSearchParams(searchQuery, statusFilter)
    const nextParamsString = nextParams.toString()

    if (searchParamsString === nextParamsString) {
      return
    }

    lastSyncedSearchRef.current = nextParamsString
    setSearchParams(nextParams, { replace: true })
  }, [searchParamsString, searchQuery, setSearchParams, statusFilter])

  useEffect(() => {
    if (searchParamsString === lastSyncedSearchRef.current) {
      return
    }

    lastSyncedSearchRef.current = searchParamsString
    const parsedParams = parseShowsSearchParams(searchParams)
    setSearchQueryState(parsedParams.searchQuery)
    setStatusFilterState(parsedParams.statusFilter)
  }, [searchParams, searchParamsString])

  const browseQuery = useInfiniteQuery({
    queryKey: ['shows', 'list'],
    queryFn: ({ pageParam, signal }) => fetchShowsPage(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + 1,
    enabled: !isSearchActive,
    retry: (failureCount, error) => !isTvmazeRateLimitError(error) && failureCount < 1,
  })

  const searchQueryResult = useQuery({
    queryKey: ['shows', 'search', debouncedQuery],
    queryFn: ({ signal }) => searchShows(debouncedQuery, signal),
    enabled: isSearchActive,
    retry: (failureCount, error) => !isTvmazeRateLimitError(error) && failureCount < 1,
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
    : false

  const hasBrowseData = Boolean(browseQuery.data?.pages.length)
  const isError = isSearchActive
    ? searchQueryResult.isError
    : browseQuery.isError && !hasBrowseData

  const error = isSearchActive ? searchQueryResult.error : browseQuery.error

  const refetch = isSearchActive ? searchQueryResult.refetch : browseQuery.refetch

  const hasNextPage = !isSearchActive && Boolean(browseQuery.hasNextPage)
  const isFetchingNextPage = browseQuery.isFetchingNextPage
  const isFetchNextPageError = !isSearchActive && browseQuery.isFetchNextPageError

  return {
    shows,
    searchQuery,
    setSearchQuery: setSearchQueryState,
    statusFilter,
    setStatusFilter: setStatusFilterState,
    isSearchActive,
    isInitialLoading,
    isUpdating,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage: browseQuery.fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isEmpty: !isInitialLoading && !isError && shows.length === 0,
  }
}
