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
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

type ShowsListStatesProps = {
  isInitialLoading: boolean
  isError: boolean
  isEmpty: boolean
  isSearchActive: boolean
  statusFilterLabel: string
  onRetry: () => void
}

export function ShowsListStates({
  isInitialLoading,
  isError,
  isEmpty,
  isSearchActive,
  statusFilterLabel,
  onRetry,
}: ShowsListStatesProps) {
  if (isInitialLoading) {
    return (
      <div
        className="flex min-w-0 flex-col gap-8"
        aria-busy="true"
        aria-label="Loading shows"
      >
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <div className="-mx-4 flex scrollbar-none gap-2 overflow-x-hidden px-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="w-28 shrink-0 sm:w-32 md:w-36">
                <Skeleton className="aspect-2/3 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
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
