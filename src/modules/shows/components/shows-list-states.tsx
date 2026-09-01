import { ShowsBrowseSkeleton } from '../components/shows-browse-skeleton'
import { ShowsGridSkeleton } from '../components/shows-grid-skeleton'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'

type ShowsListStatesProps = {
  isInitialLoading: boolean
  isError: boolean
  isEmpty: boolean
  isSearchActive: boolean
  statusFilterLabel: string
  skeletonVariant?: 'browse' | 'search'
  onRetry: () => void
}

export function ShowsListStates({
  isInitialLoading,
  isError,
  isEmpty,
  isSearchActive,
  statusFilterLabel,
  skeletonVariant = 'browse',
  onRetry,
}: ShowsListStatesProps) {
  if (isInitialLoading) {
    if (skeletonVariant === 'search') {
      return (
        <div aria-busy="true" aria-label="Loading search results">
          <ShowsGridSkeleton titleWidthClassName="w-36" cardCount={12} />
        </div>
      )
    }

    return (
      <div aria-busy="true" aria-label="Loading shows">
        <ShowsBrowseSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Could not load shows</CardTitle>
          <CardDescription>
            TVMaze may be rate-limiting or temporarily unavailable. Try again in a moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="rounded-full" onClick={onRetry}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Empty className="border-border border-white/10 bg-white/5">
        <EmptyHeader>
          <EmptyTitle>No shows to display</EmptyTitle>
          <EmptyDescription>
            {isSearchActive
              ? 'Try a different search term or clear the search field.'
              : `No shows match the ${statusFilterLabel} filter yet.`}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Spinner className="sr-only" />
        </EmptyContent>
      </Empty>
    )
  }

  return null
}
