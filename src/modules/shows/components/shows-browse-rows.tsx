import type { RefObject } from 'react'
import type { Show } from '../schemas/tvmaze.schema'
import { ShowsGrid } from './shows-grid'
import { ShowsRow } from './shows-row'

type ShowsBrowseRowsProps = {
  nextWatch: Show[]
  remaining: Show[]
  sentinelRef: RefObject<HTMLDivElement | null>
}

export function ShowsBrowseRows({
  nextWatch,
  remaining,
  sentinelRef,
}: ShowsBrowseRowsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8 [overflow-anchor:none]">
      {nextWatch.length > 0 ? (
        <ShowsRow title="Your Next Watch" shows={nextWatch} />
      ) : null}
      {remaining.length > 0 ? <ShowsGrid title="All Shows" shows={remaining} /> : null}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  )
}
