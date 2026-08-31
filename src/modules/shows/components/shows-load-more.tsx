import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'

type ShowsLoadMoreProps = {
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  hasNextPage: boolean
  onRetry: () => void
}

export function ShowsLoadMore({
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  onRetry,
}: ShowsLoadMoreProps) {
  if (isFetchNextPageError) {
    return (
      <div
        className="flex min-h-16 flex-wrap items-center justify-center gap-3 py-2 text-center"
        role="status"
      >
        <p className="text-muted-foreground text-sm">
          Could not load more shows. Your place is saved.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          onClick={onRetry}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (isFetchingNextPage) {
    return (
      <div className="flex min-h-16 items-center justify-center py-2" aria-live="polite">
        <Spinner className="size-6" />
        <span className="sr-only">Loading more shows</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-16 items-center justify-center py-2">
      {!hasNextPage ? (
        <p className="text-muted-foreground text-sm">You’ve reached the end.</p>
      ) : null}
    </div>
  )
}
