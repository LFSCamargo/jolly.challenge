import type { RefObject } from 'react'
import type { ShowRow } from '../services/build-show-rows.service'
import { ShowsRow } from './shows-row'

type ShowsBrowseRowsProps = {
  rows: ShowRow[]
  sentinelRef: RefObject<HTMLDivElement | null>
}

export function ShowsBrowseRows({ rows, sentinelRef }: ShowsBrowseRowsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-8 [overflow-anchor:none]">
      {rows.map((row) => (
        <ShowsRow key={row.id} title={row.title} shows={row.shows} />
      ))}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  )
}
