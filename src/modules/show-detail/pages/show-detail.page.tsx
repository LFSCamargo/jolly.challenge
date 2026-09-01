import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchEpisodes, fetchShow } from '@/modules/shows'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Link, useParams } from 'react-router-dom'
import { ShowDetailHero } from '../components/show-detail-hero'
import { ShowEpisodes } from '../components/show-episodes'
import { ShowsHeroSkeleton } from '@/modules/shows'

function parseShowId(rawShowId: string | undefined): number | null {
  if (!rawShowId) {
    return null
  }

  const showId = Number.parseInt(rawShowId, 10)
  return Number.isFinite(showId) && showId > 0 ? showId : null
}

export function ShowDetailPage() {
  const { showId: rawShowId } = useParams()
  const showId = parseShowId(rawShowId)

  const showQuery = useQuery({
    queryKey: ['shows', showId],
    queryFn: ({ signal }) => {
      if (!showId) {
        throw new Error('Invalid show id')
      }

      return fetchShow(showId, signal)
    },
    enabled: showId !== null,
  })

  const episodesQuery = useQuery({
    queryKey: ['shows', showId, 'episodes'],
    queryFn: ({ signal }) => {
      if (!showId) {
        throw new Error('Invalid show id')
      }

      return fetchEpisodes(showId, signal)
    },
    enabled: showId !== null,
  })

  if (showId === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-24 sm:px-6 md:pb-8">
        <Empty className="border-border border">
          <EmptyHeader>
            <EmptyTitle>Invalid show</EmptyTitle>
            <EmptyDescription>The show link is malformed.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/" className={cn(buttonVariants())}>
              Back to shows
            </Link>
          </EmptyContent>
        </Empty>
      </main>
    )
  }

  if (showQuery.isPending) {
    return (
      <div className="flex min-w-0 flex-col overflow-x-hidden pb-24 md:pb-8">
        <section className="mx-auto w-full max-w-[1920px] px-4 pt-20 pb-6 sm:px-8 lg:px-12">
          <ShowsHeroSkeleton />
        </section>
        <main
          aria-busy="true"
          aria-label="Loading show details"
          className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-6 px-4 sm:px-8 lg:max-w-4xl lg:px-12"
        >
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </main>
      </div>
    )
  }

  if (showQuery.isError || !showQuery.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 pt-20 pb-24 sm:px-6 md:pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Could not load show</CardTitle>
            <CardDescription>Try again or return to the show list.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                void showQuery.refetch()
              }}
            >
              Retry
            </Button>
            <Link to="/" className={cn(buttonVariants({ variant: 'outline' }))}>
              Back to shows
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  const show = showQuery.data

  return (
    <div className="flex min-w-0 flex-col overflow-x-hidden pb-24 md:pb-8">
      <ShowDetailHero show={show} />
      <main className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-8 px-4 pb-24 sm:px-8 lg:max-w-4xl lg:px-12 md:pb-8">
        <ShowEpisodes
          episodes={episodesQuery.data}
          isPending={episodesQuery.isPending}
          isFetching={episodesQuery.isFetching}
          isError={episodesQuery.isError}
          onRetry={() => {
            void episodesQuery.refetch()
          }}
        />
      </main>
    </div>
  )
}
