import { describe, expect, it } from 'vitest'
import {
  parseShowsSearchParams,
  serializeShowsSearchParams,
} from '../services/shows-query-params.service'

describe('shows-query-params.service', () => {
  it('parses search and status from the query string', () => {
    const params = new URLSearchParams('q=mock&status=Ended')

    expect(parseShowsSearchParams(params)).toEqual({
      searchQuery: 'mock',
      statusFilter: 'Ended',
    })
  })

  it('defaults missing params', () => {
    expect(parseShowsSearchParams(new URLSearchParams())).toEqual({
      searchQuery: '',
      statusFilter: 'all',
    })
  })

  it('ignores invalid status values', () => {
    expect(parseShowsSearchParams(new URLSearchParams('status=invalid')).statusFilter).toBe(
      'all',
    )
  })

  it('serializes search and status', () => {
    const params = serializeShowsSearchParams('mock', 'Running')

    expect(params.get('q')).toBe('mock')
    expect(params.get('status')).toBe('Running')
  })

  it('omits default values from the query string', () => {
    expect(serializeShowsSearchParams('', 'all').toString()).toBe('')
    expect(serializeShowsSearchParams('  ', 'all').toString()).toBe('')
  })
})
