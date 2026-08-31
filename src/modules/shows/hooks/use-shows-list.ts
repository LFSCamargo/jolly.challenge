import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  filterShowsByStatus,
  showMatchesSearchQuery,
} from '../services/filter-shows.service'
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

type UseShowsListOptions = {
  browseEnabled?: boolean
}

export function useShowsList({ browseEnabled = true }: UseShowsListOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialParams = parseShowsSearchParams(searchParams)
  const lastSyncedSearchRef = useRef(searchParams.toString())
  const pendingLocalSyncRef = useRef(false)

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
      lastSyncedSearchRef.current = nextParamsString
      pendingLocalSyncRef.current = false
      return
    }

    if (pendingLocalSyncRef.current) {
      lastSyncedSearchRef.current = nextParamsString
      setSearchParams(nextParams, { replace: true })
      pendingLocalSyncRef.current = false
      return
    }

    lastSyncedSearchRef.current = searchParamsString
    const parsedParams = parseShowsSearchParams(searchParams)
    setSearchQueryState(parsedParams.searchQuery)
    setStatusFilterState(parsedParams.statusFilter)
  }, [searchParams, searchParamsString, searchQuery, setSearchParams, statusFilter])

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
    enabled: browseEnabled || isSearchActive,
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

  const mergedSearchShows = useMemo(() => {
    const ranked = searchQueryResult.data ?? []
    const seenIds = new Set(ranked.map((show) => show.id))
    const extras = (browseQuery.data?.pages.flat() ?? []).filter((show) => {
      if (seenIds.has(show.id)) {
        return false
      }

      return showMatchesSearchQuery(show, debouncedQuery)
    })

    return [...ranked, ...extras]
  }, [browseQuery.data?.pages, debouncedQuery, searchQueryResult.data])

  const filteredSearchShows = useMemo(
    () => filterShowsByStatus(mergedSearchShows, statusFilter),
    [mergedSearchShows, statusFilter],
  )

  const filteredBrowseShows = useMemo(
    () => filterShowsByStatus(browseQuery.data?.pages.flat() ?? [], statusFilter),
    [browseQuery.data?.pages, statusFilter],
  )

  const shows = isSearchActive ? filteredSearchShows : filteredBrowseShows

  const reachedEnd = Boolean(browseQuery.data?.pages.some((page) => page.length === 0))

  const isInitialLoading = isSearchActive
    ? searchQueryResult.isPending && !searchQueryResult.data
    : browseEnabled && browseQuery.isPending && !browseQuery.data

  const isUpdating = isSearchActive
    ? searchQueryResult.isFetching && Boolean(searchQueryResult.data)
    : false

  const hasBrowseData = Boolean(browseQuery.data?.pages.some((page) => page.length > 0))
  const isError = isSearchActive
    ? searchQueryResult.isError
    : browseEnabled && browseQuery.isError && !hasBrowseData

  const error = isSearchActive ? searchQueryResult.error : browseQuery.error

  const refetch = isSearchActive ? searchQueryResult.refetch : browseQuery.refetch

  const hasNextPage = !reachedEnd && Boolean(browseQuery.hasNextPage)
  const isFetchingNextPage = browseQuery.isFetchingNextPage

  const fetchNextPage = () => {
    if (reachedEnd || isFetchingNextPage || !hasNextPage) {
      return Promise.resolve()
    }

    return browseQuery.fetchNextPage()
  }

  const setSearchQuery = (value: string) => {
    pendingLocalSyncRef.current = true
    setSearchQueryState(value)
  }

  const setStatusFilter = (value: StatusFilter) => {
    pendingLocalSyncRef.current = true
    setStatusFilterState(value)
  }

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
    fetchNextPage,
    isFetchingNextPage,
    isEmpty:
      (browseEnabled || isSearchActive) &&
      !isInitialLoading &&
      !isError &&
      (isSearchActive ? filteredSearchShows.length === 0 : shows.length === 0),
  }
}
