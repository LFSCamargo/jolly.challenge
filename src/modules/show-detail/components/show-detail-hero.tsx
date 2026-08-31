import { Button, buttonVariants } from '@/components/ui/button'
import { stripHtml } from '@/lib/strip-html'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/modules/favorites'
import { getShowDetailImage, type Show } from '@/modules/shows'
import { HeartIcon, PlayIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ShowStatusBadge } from '@/common/components/show-status-badge'

type ShowDetailHeroProps = {
  show: Show
}

export function ShowDetailHero({ show }: ShowDetailHeroProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite(show.id))
  const imageUrl = getShowDetailImage(show)
  const summary = show.summary ? stripHtml(show.summary) : null
  const metadata = [show.status, ...(show.genres ?? [])].join(' • ')

  return (
    <section className="relative min-h-[min(70vh,680px)] overflow-hidden">
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

      <div className="relative mx-auto flex min-h-[min(70vh,680px)] w-full max-w-[1920px] min-w-0 flex-col justify-end gap-4 px-4 pt-24 pb-12 sm:px-8 lg:px-12">
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'w-fit rounded-full bg-black/40 hover:bg-black/60',
          )}
        >
          ← Back to Browse
        </Link>
        <div className="flex min-w-0 flex-col gap-3 lg:max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{show.name}</h1>
          <ShowStatusBadge status={show.status} />
          {show.rating?.average ? (
            <p className="text-muted-foreground text-sm">
              Rating {show.rating.average.toFixed(1)}
            </p>
          ) : null}
          {metadata ? (
            <p className="text-muted-foreground text-xs tracking-wide uppercase sm:text-sm">
              {metadata}
            </p>
          ) : null}
          {summary ? (
            <p className="text-foreground/90 line-clamp-4 max-w-2xl text-sm leading-relaxed sm:text-base">
              {summary}
            </p>
          ) : null}
          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#episodes"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'netflix-play h-12 w-full rounded-full px-8 sm:w-auto',
              )}
            >
              <PlayIcon data-icon="inline-start" />
              Play
            </a>
            <Button
              type="button"
              className="h-12 w-full rounded-full px-8 sm:w-auto"
              variant="outline"
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
                className={isFavorite ? 'fill-current' : ''}
              />
              {isFavorite ? 'In My List' : 'My List'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
