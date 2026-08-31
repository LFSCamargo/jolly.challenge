import { describe, expect, it } from 'vitest'
import { buildShowRows, SHOW_ROW_SIZE } from '../services/build-show-rows.service'
import { mockShow } from './fixtures/shows.fixture'

function makeShow(id: number, genres: string[] = ['Drama']) {
  return {
    ...mockShow,
    id,
    name: `Show ${id}`,
    genres,
  }
}

describe('buildShowRows', () => {
  it('skips the featured show and keeps the first row stable when more shows arrive', () => {
    const firstPage = Array.from({ length: SHOW_ROW_SIZE + 2 }, (_, index) =>
      makeShow(index + 1, index < 6 ? ['Drama'] : ['Comedy']),
    )
    const firstRows = buildShowRows(firstPage, { featuredShowId: 1 })
    const nextWatchIds = firstRows[0]?.shows.map((show) => show.id)

    const secondPage = [...firstPage, makeShow(100, ['Action']), makeShow(101, ['Comedy'])]
    const secondRows = buildShowRows(secondPage, { featuredShowId: 1 })

    expect(firstRows[0]?.title).toBe('Your Next Watch')
    expect(firstRows[0]?.shows.some((show) => show.id === 1)).toBe(false)
    expect(secondRows[0]?.shows.map((show) => show.id)).toEqual(nextWatchIds)
    expect(secondRows.map((row) => row.id)[0]).toBe(firstRows[0]?.id)
    expect(secondRows.length).toBeGreaterThanOrEqual(firstRows.length)
  })

  it('returns no catalog rows when only the featured show is present', () => {
    expect(buildShowRows([mockShow], { featuredShowId: mockShow.id })).toEqual([])
  })
})
