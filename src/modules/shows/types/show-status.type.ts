export const SHOW_STATUSES = ['Running', 'Ended', 'To Be Determined'] as const

type ShowStatus = (typeof SHOW_STATUSES)[number]

export type StatusFilter = 'all' | ShowStatus

const STATUS_FILTERS: readonly StatusFilter[] = ['all', ...SHOW_STATUSES]

export function isStatusFilter(value: string): value is StatusFilter {
  return STATUS_FILTERS.some((status) => status === value)
}
