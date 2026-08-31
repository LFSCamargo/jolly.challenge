import { useEffect, useMemo, useRef } from 'react'
import { useShowsList } from '../hooks/use-shows-list'
import { useInfiniteScroll } from '../hooks/use-infinite-scroll'
import { buildShowRows } from '../services/build-show-rows.service'
import { ShowsBrowseRows } from '../components/shows-browse-rows'
import { ShowsGrid } from '../components/shows-grid'
import { ShowsHero } from '../components/shows-hero'
import { ShowsListStates } from '../components/shows-list-states'
import { ShowsToolbar } from '../components/shows-toolbar'

export function ShowsPage() {
  const {
    shows,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isSearchActive,
    isInitialLoading,
    isUpdating,
    isError,
    isEmpty,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useShowsList()

  const sentinelRef = useInfiniteScroll(
    () => {
      void fetchNextPage()
    },
    !isSearchActive,
    hasNextPage,
    isFetchingNextPage,
  )

  const statusFilterLabel = statusFilter === 'all' ? 'All' : statusFilter
  const showCatalog = !isInitialLoading && !isError && !isEmpty
  const lockedFeaturedIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    lockedFeaturedIdRef.current = undefined
  }, [isSearchActive, statusFilter])

  if (!isSearchActive && shows[0] && lockedFeaturedIdRef.current === undefined) {
    lockedFeaturedIdRef.current = shows[0].id
  }

  const featuredShow = !isSearchActive
    ? (shows.find((show) => show.id === lockedFeaturedIdRef.current) ?? shows[0])
    : undefined
  const rows = useMemo(
    () =>
      buildShowRows(shows, {
        featuredShowId: featuredShow?.id,
      }),
    [featuredShow?.id, shows],
  )

  return (
    <div className="flex min-w-0 flex-col overflow-x-hidden [overflow-anchor:none] pb-24 md:pb-8">
      {featuredShow ? <ShowsHero show={featuredShow} /> : null}

      <main className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-8 px-4 py-6 sm:px-8 lg:px-12">
        {!featuredShow ? (
          <div className="flex flex-col gap-2 pt-16">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isSearchActive ? 'Search' : 'Shows'}
            </h1>
          </div>
        ) : null}

        <ShowsToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isUpdating={isUpdating}
        />

        <ShowsListStates
          isInitialLoading={isInitialLoading}
          isError={isError}
          isEmpty={isEmpty}
          isSearchActive={isSearchActive}
          statusFilterLabel={statusFilterLabel}
          onRetry={() => {
            void refetch()
          }}
        />

        {showCatalog && isSearchActive ? (
          <ShowsGrid shows={shows} title="Search Results" />
        ) : null}

        {showCatalog && !isSearchActive && rows.length > 0 ? (
          <ShowsBrowseRows rows={rows} sentinelRef={sentinelRef} />
        ) : null}

        {showCatalog && !isSearchActive && rows.length === 0 && featuredShow ? (
          <p className="text-muted-foreground text-sm">
            No additional shows match your filters. Try another status or clear search.
          </p>
        ) : null}
      </main>
    </div>
  )
}
