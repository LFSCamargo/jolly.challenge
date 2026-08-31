import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { stripHtml } from '@/lib/strip-html'
import type { Episode } from '@/modules/shows'
import { getSortedSeasonNumbers, groupEpisodesBySeason } from '@/modules/shows'

type ShowEpisodesProps = {
  episodes: Episode[] | undefined
  isPending: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
}

export function ShowEpisodes({
  episodes,
  isPending,
  isFetching,
  isError,
  onRetry,
}: ShowEpisodesProps) {
  const groupedEpisodes = groupEpisodesBySeason(episodes ?? [])
  const seasons = getSortedSeasonNumbers(groupedEpisodes)

  return (
    <section id="episodes" className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Episodes</h2>
        {isFetching ? <Spinner className="size-4" /> : null}
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : null}

      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Could not load episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={onRetry}>
              Retry episodes
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isPending && !isError && seasons.length === 0 ? (
        <Empty className="border-border border">
          <EmptyHeader>
            <EmptyTitle>No episodes listed</EmptyTitle>
            <EmptyDescription>
              TVMaze has no episode data for this show yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {seasons.map((season) => (
        <div key={season} className="flex min-w-0 flex-col gap-3">
          <h3 className="text-lg font-medium">Season {season}</h3>
          <Separator />
          <ul className="flex flex-col gap-3">
            {(groupedEpisodes.get(season) ?? []).map((episode) => (
              <li key={episode.id} className="min-w-0">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>
                      {episode.number ? `E${episode.number}` : 'Episode'} — {episode.name}
                    </CardTitle>
                    {episode.airdate ? (
                      <CardDescription>Aired {episode.airdate}</CardDescription>
                    ) : null}
                  </CardHeader>
                  {episode.summary ? (
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 text-sm">
                        {stripHtml(episode.summary)}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
