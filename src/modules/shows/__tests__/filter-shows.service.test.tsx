import { describe, expect, it } from 'vitest'
import { filterShowsByStatus } from '../services/filter-shows.service'
import { isStatusFilter } from '../types/show-status.type'
import { mockEndedShow, mockShow } from './fixtures/shows.fixture'

describe('filterShowsByStatus', () => {
  it('returns all shows when filter is all', () => {
    expect(filterShowsByStatus([mockShow, mockEndedShow], 'all')).toHaveLength(2)
  })

  it('filters by a specific status', () => {
    expect(filterShowsByStatus([mockShow, mockEndedShow], 'Running')).toEqual([mockShow])
  })
})

describe('isStatusFilter', () => {
  it('accepts known filters and rejects unknown values', () => {
    expect(isStatusFilter('all')).toBe(true)
    expect(isStatusFilter('Ended')).toBe(true)
    expect(isStatusFilter('nope')).toBe(false)
  })
})
