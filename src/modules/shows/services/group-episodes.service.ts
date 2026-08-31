import type { Episode } from '../schemas/tvmaze.schema'

export function groupEpisodesBySeason(episodes: Episode[]): Map<number, Episode[]> {
  const grouped = new Map<number, Episode[]>()

  for (const episode of episodes) {
    const seasonEpisodes = grouped.get(episode.season) ?? []
    seasonEpisodes.push(episode)
    grouped.set(episode.season, seasonEpisodes)
  }

  for (const seasonEpisodes of grouped.values()) {
    seasonEpisodes.sort((left, right) => (left.number ?? 0) - (right.number ?? 0))
  }

  return grouped
}

export function getSortedSeasonNumbers(grouped: Map<number, Episode[]>): number[] {
  return [...grouped.keys()].sort((left, right) => left - right)
}
