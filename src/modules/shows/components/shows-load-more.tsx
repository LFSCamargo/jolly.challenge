import { Spinner } from '@/components/ui/spinner'

type ShowsLoadMoreProps = {
  isFetchingNextPage: boolean
}

export function ShowsLoadMore({ isFetchingNextPage }: ShowsLoadMoreProps) {
  if (!isFetchingNextPage) {
    return null
  }

  return (
    <div className="flex justify-center py-6" aria-live="polite">
      <Spinner className="size-6" />
      <span className="sr-only">Loading more shows</span>
    </div>
  )
}
