import type { RefObject } from 'react'
import type { ShowRow } from '../services/build-show-rows.service'
import { ShowsLoadMore } from './shows-load-more'
import { ShowsRow } from './shows-row'

type ShowsBrowseRowsProps = {
  rows: ShowRow[]
  sentinelRef: RefObject<HTMLDivElement | null>
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  hasNextPage: boolean
  onRetryNextPage: () => void
}

export function ShowsBrowseRows({
  rows,
  sentinelRef,
  isFetchingNextPage,
  isFetchNextPageError,
  hasNextPage,
  onRetryNextPage,
}: ShowsBrowseRowsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      {rows.map((row) => (
        <ShowsRow key={row.id} title={row.title} shows={row.shows} />
      ))}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      <ShowsLoadMore
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        hasNextPage={hasNextPage}
        onRetry={onRetryNextPage}
      />
    </div>
  )
}
