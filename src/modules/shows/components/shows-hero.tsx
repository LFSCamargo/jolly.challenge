import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { stripHtml } from '@/lib/strip-html'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/modules/favorites'
import { getShowDetailImage, getShowListImage } from '../services/tvmaze.service'
import type { Show } from '../schemas/tvmaze.schema'
import { HeartIcon, PlayIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type ShowsHeroProps = {
  show: Show
}

export function ShowsHero({ show }: ShowsHeroProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite(show.id))
  const imageUrl = getShowDetailImage(show) ?? getShowListImage(show)
  const summary = show.summary ? stripHtml(show.summary) : null
  const metadata = ['Show', show.status, ...(show.genres?.slice(0, 2) ?? [])].join(' • ')

  return (
    <section className="relative min-h-[min(78vh,760px)] overflow-hidden">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover object-top"
          />
          <div className="netflix-hero-gradient absolute inset-0" />
          <div className="netflix-hero-gradient-bottom absolute inset-0" />
        </>
      ) : (
        <div className="from-muted/40 to-background absolute inset-0 bg-gradient-to-b" />
      )}

      <div className="relative mx-auto flex min-h-[min(78vh,760px)] w-full max-w-[1920px] min-w-0 flex-col justify-end px-4 pt-24 pb-16 sm:px-8 lg:max-w-3xl lg:px-12 lg:pb-20">
        <Badge
          variant="outline"
          className="mb-3 w-fit rounded-full border-white/30 bg-black/30"
        >
          FEATURED
        </Badge>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-6xl">
          {show.name}
        </h1>
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase sm:text-sm">
          {metadata}
        </p>
        {summary ? (
          <p className="text-foreground/90 mb-6 line-clamp-3 max-w-xl text-sm leading-relaxed sm:text-base">
            {summary}
          </p>
        ) : null}

        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to={`/shows/${show.id}`}
            className={cn(
              buttonVariants({ size: 'lg' }),
              'netflix-play h-12 w-full rounded-full px-8 sm:w-auto',
            )}
          >
            <PlayIcon data-icon="inline-start" />
            Play
          </Link>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-full px-8 sm:w-auto"
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Remove ${show.name} from favorites`
                : `Add ${show.name} to favorites`
            }
            onClick={() => {
              toggleFavorite(show)
            }}
          >
            <HeartIcon
              data-icon="inline-start"
              className={cn(isFavorite && 'text-primary fill-current')}
            />
            {isFavorite ? 'In My List' : 'My List'}
          </Button>
        </div>
      </div>
    </section>
  )
}
