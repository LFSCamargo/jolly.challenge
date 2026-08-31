import { describe, expect, it } from 'vitest'
import {
  buildBrowseSections,
  SHOW_ROW_SIZE,
} from '../services/build-browse-sections.service'
import { mockShow } from './fixtures/shows.fixture'

function makeShow(id: number, genres: string[] = ['Drama']) {
  return {
    ...mockShow,
    id,
    name: `Show ${id}`,
    genres,
  }
}

describe('buildBrowseSections', () => {
  it('keeps a stable next-watch rail and appends later shows to one list', () => {
    const firstPage = Array.from({ length: SHOW_ROW_SIZE + 2 }, (_, index) =>
      makeShow(index + 1, index < 6 ? ['Drama'] : ['Comedy']),
    )
    const first = buildBrowseSections(firstPage, { featuredShowId: 1 })

    const secondPage = [
      ...firstPage,
      makeShow(100, ['Action']),
      makeShow(101, ['Comedy']),
    ]
    const second = buildBrowseSections(secondPage, { featuredShowId: 1 })

    expect(first.nextWatch).toHaveLength(SHOW_ROW_SIZE)
    expect(first.nextWatch.some((show) => show.id === 1)).toBe(false)
    expect(first.remaining.some((show) => show.id === 1)).toBe(false)
    expect(second.nextWatch.map((show) => show.id)).toEqual(
      first.nextWatch.map((show) => show.id),
    )
    expect(second.remaining.map((show) => show.id)).toEqual([
      ...first.remaining.map((show) => show.id),
      100,
      101,
    ])
  })

  it('returns empty sections when only the featured show is present', () => {
    expect(buildBrowseSections([mockShow], { featuredShowId: mockShow.id })).toEqual({
      nextWatch: [],
      remaining: [],
    })
  })
})
