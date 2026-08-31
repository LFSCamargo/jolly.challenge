import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SearchIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  isStatusFilter,
  SHOW_STATUSES,
  type StatusFilter,
} from '../types/show-status.type'

type ShowsToolbarProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  isUpdating: boolean
}

export function ShowsToolbar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  isUpdating,
}: ShowsToolbarProps) {
  const location = useLocation()

  useEffect(() => {
    if (location.hash === '#search') {
      document.getElementById('search-shows')?.focus()
    }
  }, [location.hash])

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label htmlFor="search-shows" className="sr-only">
          Search shows
        </label>
        <InputGroup className="h-11 w-full min-w-0 rounded-full border-white/10 bg-white/10">
          <InputGroupInput
            id="search-shows"
            aria-label="Search shows"
            placeholder="Titles, genres, keywords"
            className="h-11"
            value={searchQuery}
            onChange={(event) => {
              onSearchQueryChange(event.target.value)
            }}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <ToggleGroup
        value={[statusFilter]}
        onValueChange={(value) => {
          const next = value[0]
          if (next && isStatusFilter(next)) {
            onStatusFilterChange(next)
          }
        }}
        variant="outline"
        size="lg"
        className="w-full max-w-full min-w-0 flex-wrap sm:w-auto"
        aria-label="Filter by status"
      >
        <ToggleGroupItem value="all" className="min-h-11 rounded-full px-3">
          All
        </ToggleGroupItem>
        {SHOW_STATUSES.map((status) => (
          <ToggleGroupItem
            key={status}
            value={status}
            aria-label={status}
            className="min-h-11 rounded-full px-3"
          >
            {status === 'To Be Determined' ? 'TBD' : status}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isUpdating ? (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Updating…
        </p>
      ) : null}
    </div>
  )
}
