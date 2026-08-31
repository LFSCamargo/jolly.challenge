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
  it('puts My List first, skips the featured show, and groups leftover shows by genre', () => {
    const catalog = Array.from({ length: SHOW_ROW_SIZE + 4 }, (_, index) =>
      makeShow(index + 1),
    )
    const favorite = makeShow(2)

    const rows = buildShowRows(catalog, {
      featuredShowId: 1,
      favoriteShows: [favorite],
    })

    expect(rows.map((row) => row.title)).toEqual(['My List', 'Your Next Watch', 'Drama'])
    expect(rows[0]?.shows).toEqual([favorite])
    expect(rows[1]?.shows).toHaveLength(SHOW_ROW_SIZE)
    expect(rows[1]?.shows.some((show) => show.id === 1)).toBe(false)
    expect(rows[2]?.shows.some((show) => show.id === 1)).toBe(false)
    expect(rows[2]?.shows.length).toBeGreaterThanOrEqual(4)
  })

  it('returns no catalog rows when only the featured show is present', () => {
    expect(buildShowRows([mockShow], { featuredShowId: mockShow.id })).toEqual([])
  })
})
