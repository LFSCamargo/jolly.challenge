import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useShowsList } from '../hooks/use-shows-list'
import { useHomeEnterTransition } from '../hooks/use-home-enter-transition'
import { useInfiniteScroll } from '../hooks/use-infinite-scroll'
import { buildBrowseSections } from '../services/build-browse-sections.service'
import { ShowsBrowseRows } from '../components/shows-browse-rows'
import { ShowsGrid } from '../components/shows-grid'
import { ShowsHero } from '../components/shows-hero'
import { ShowsHeroSkeleton } from '../components/shows-hero-skeleton'
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
  const isEnteringFromSearch = useHomeEnterTransition()
  const homeEnterClass = useMemo(
    () =>
      cn(
        'motion-reduce:animate-none',
        isEnteringFromSearch &&
          'animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out',
      ),
    [isEnteringFromSearch],
  )
  const homeHeroEnterClass = useMemo(
    () =>
      cn(
        'motion-reduce:animate-none',
        isEnteringFromSearch &&
          'animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 ease-out',
      ),
    [isEnteringFromSearch],
  )

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
  const { nextWatch, remaining } = useMemo(
    () =>
      buildBrowseSections(shows, {
        featuredShowId: featuredShow?.id,
      }),
    [featuredShow?.id, shows],
  )

  return (
    <div className="flex min-w-0 flex-col overflow-x-hidden pb-24 [overflow-anchor:none] md:pb-8">
      <main className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-8 px-4 pt-20 pb-6 sm:px-8 lg:px-12">
        {isInitialLoading && !isSearchActive ? (
          <ShowsHeroSkeleton />
        ) : featuredShow ? (
          <div className={homeHeroEnterClass}>
            <ShowsHero show={featuredShow} />
          </div>
        ) : null}

        <div
          className={cn(
            homeEnterClass,
            isEnteringFromSearch && 'delay-150',
          )}
        >
          <ShowsToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            isUpdating={isUpdating}
            showSearch={false}
          />
        </div>

        <ShowsListStates
          isInitialLoading={isInitialLoading}
          isError={isError}
          isEmpty={isEmpty}
          isSearchActive={isSearchActive}
          statusFilterLabel={statusFilterLabel}
          skeletonVariant={isSearchActive ? 'search' : 'browse'}
          onRetry={() => {
            void refetch()
          }}
        />

        {showCatalog && isSearchActive ? (
          <ShowsGrid shows={shows} title="Search Results" />
        ) : null}

        {showCatalog &&
        !isSearchActive &&
        (nextWatch.length > 0 || remaining.length > 0) ? (
          <div
            className={cn(
              homeEnterClass,
              isEnteringFromSearch && 'delay-300',
            )}
          >
            <ShowsBrowseRows
              nextWatch={nextWatch}
              remaining={remaining}
              sentinelRef={sentinelRef}
            />
          </div>
        ) : null}

        {showCatalog &&
        !isSearchActive &&
        nextWatch.length === 0 &&
        remaining.length === 0 &&
        featuredShow ? (
          <p className="text-muted-foreground text-sm">
            No additional shows match your filters. Try another status or clear search.
          </p>
        ) : null}
      </main>
    </div>
  )
}
