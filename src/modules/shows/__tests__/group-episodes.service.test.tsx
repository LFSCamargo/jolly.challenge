import { describe, expect, it } from 'vitest'
import {
  getSortedSeasonNumbers,
  groupEpisodesBySeason,
} from '../services/group-episodes.service'
import { mockEpisodes } from './fixtures/shows.fixture'

describe('groupEpisodesBySeason', () => {
  it('groups and sorts episodes by season and number', () => {
    const grouped = groupEpisodesBySeason(mockEpisodes)

    expect(getSortedSeasonNumbers(grouped)).toEqual([1, 2])
    expect(grouped.get(1)?.map((episode) => episode.number)).toEqual([1, 2])
    expect(grouped.get(2)?.[0]?.name).toBe('Season Two Premiere')
  })
})
