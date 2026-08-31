import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { isMobileViewport } from '@/common/utils/viewport'
import { SearchIcon } from 'lucide-react'
import { ShowsGrid } from '../components/shows-grid'
import { ShowsListStates } from '../components/shows-list-states'
import { ShowsToolbar } from '../components/shows-toolbar'
import { useInfiniteScroll } from '../hooks/use-infinite-scroll'
import { useShowsList } from '../hooks/use-shows-list'

export function SearchPage() {
  const autoFocusMobileSearch = isMobileViewport()
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
  } = useShowsList({ browseEnabled: false })

  const sentinelRef = useInfiniteScroll(
    () => {
      void fetchNextPage()
    },
    isSearchActive,
    hasNextPage,
    isFetchingNextPage,
  )

  const statusFilterLabel = statusFilter === 'all' ? 'All' : statusFilter

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1920px] min-w-0 flex-col gap-8 px-4 pt-24 pb-28 sm:px-8 md:pb-12 lg:px-12">
      <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-2 duration-300 motion-reduce:animate-none">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Search shows</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find a title, genre, or keyword.
        </p>
      </div>

      <ShowsToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isUpdating={isUpdating}
        autoFocusSearch={autoFocusMobileSearch}
        mobileSearchOnly
      />

      {!isSearchActive ? (
        <Empty className="animate-in fade-in border-white/10 bg-white/5 duration-300 motion-reduce:animate-none">
          <EmptyHeader>
            <SearchIcon aria-hidden="true" />
            <EmptyTitle>What do you want to watch?</EmptyTitle>
            <EmptyDescription>
              Start typing to search the TVMaze catalog.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ShowsListStates
            isInitialLoading={isInitialLoading}
            isError={isError}
            isEmpty={isEmpty}
            isSearchActive
            statusFilterLabel={statusFilterLabel}
            onRetry={() => {
              void refetch()
            }}
          />

          {!isInitialLoading && !isError && !isEmpty ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none">
              <ShowsGrid shows={shows} title="Search Results" />
              <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
            </div>
          ) : null}
        </>
      )}
    </main>
  )
}
