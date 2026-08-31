import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { SearchIcon, XIcon } from 'lucide-react'
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
  showSearch?: boolean
  autoFocusSearch?: boolean
  mobileSearchOnly?: boolean
}

export function ShowsToolbar({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  isUpdating,
  showSearch = true,
  autoFocusSearch = false,
  mobileSearchOnly = false,
}: ShowsToolbarProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
      {showSearch ? (
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-2',
            mobileSearchOnly && 'md:hidden',
          )}
        >
          <label htmlFor="search-shows" className="sr-only">
            Search shows
          </label>
          <InputGroup className="h-12 w-full min-w-0 rounded-full border-white/15 bg-white/10 shadow-lg shadow-black/20 transition-[border-color,background-color,box-shadow] duration-300 focus-within:border-white/40 focus-within:bg-black/80 focus-within:shadow-black/40">
            <InputGroupInput
              id="search-shows"
              aria-label="Search shows"
              placeholder="Titles, genres, keywords"
              className="h-12"
              value={searchQuery}
              autoFocus={autoFocusSearch}
              onChange={(event) => {
                onSearchQueryChange(event.target.value)
              }}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            {searchQuery ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  aria-label="Clear search"
                  onClick={() => {
                    onSearchQueryChange('')
                  }}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
        </div>
      ) : null}

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
        className="w-full max-w-full min-w-0 flex-wrap sm:ml-auto sm:w-auto"
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

      {showSearch && isUpdating ? (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Updating…
        </p>
      ) : null}
    </div>
  )
}
