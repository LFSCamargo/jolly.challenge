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

const isTestEnv = import.meta.env.MODE === 'test'
const RATE_LIMIT_RETRY_DELAY_MS = isTestEnv ? 1 : 2_500
const RATE_LIMIT_MAX_RETRIES = isTestEnv ? 3 : 20

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
    getNextPageParam: (lastPage, pages, lastPageParam) => {
      if (pages.some((page) => page.length === 0) || lastPage.length === 0) {
        return undefined
      }

      return lastPageParam + 1
    },
    enabled: !isSearchActive,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) =>
      isTvmazeRateLimitError(error)
        ? failureCount < RATE_LIMIT_MAX_RETRIES
        : failureCount < 1,
    retryDelay: (attemptIndex, error) =>
      isTvmazeRateLimitError(error)
        ? RATE_LIMIT_RETRY_DELAY_MS * (attemptIndex + 1)
        : 500,
  })

  const searchQueryResult = useQuery({
    queryKey: ['shows', 'search', debouncedQuery],
    queryFn: ({ signal }) => searchShows(debouncedQuery, signal),
    enabled: isSearchActive,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) =>
      isTvmazeRateLimitError(error)
        ? failureCount < RATE_LIMIT_MAX_RETRIES
        : failureCount < 1,
    retryDelay: (attemptIndex, error) =>
      isTvmazeRateLimitError(error)
        ? RATE_LIMIT_RETRY_DELAY_MS * (attemptIndex + 1)
        : 500,
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

  const reachedEnd =
    !isSearchActive && Boolean(browseQuery.data?.pages.some((page) => page.length === 0))

  const isInitialLoading = isSearchActive
    ? searchQueryResult.isPending && !searchQueryResult.data
    : browseQuery.isPending && !browseQuery.data

  const isUpdating = isSearchActive
    ? searchQueryResult.isFetching && Boolean(searchQueryResult.data)
    : false

  const hasBrowseData = Boolean(browseQuery.data?.pages.some((page) => page.length > 0))
  const isError = isSearchActive
    ? searchQueryResult.isError
    : browseQuery.isError && !hasBrowseData

  const error = isSearchActive ? searchQueryResult.error : browseQuery.error

  const refetch = isSearchActive ? searchQueryResult.refetch : browseQuery.refetch

  const hasNextPage = !isSearchActive && !reachedEnd && Boolean(browseQuery.hasNextPage)
  const isFetchingNextPage = browseQuery.isFetchingNextPage

  const fetchNextPage = () => {
    if (reachedEnd || isFetchingNextPage || !hasNextPage) {
      return Promise.resolve()
    }

    return browseQuery.fetchNextPage()
  }

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
    fetchNextPage,
    isFetchingNextPage,
    isEmpty: !isInitialLoading && !isError && shows.length === 0,
  }
}
