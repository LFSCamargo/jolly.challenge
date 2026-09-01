import { ShowsGridSkeleton } from './shows-grid-skeleton'
import { ShowsRowSkeleton } from './shows-row-skeleton'

export function ShowsBrowseSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <ShowsRowSkeleton />
      <ShowsGridSkeleton titleWidthClassName="w-24" cardCount={12} />
    </div>
  )
}
