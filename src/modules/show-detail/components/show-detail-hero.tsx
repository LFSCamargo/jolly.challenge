import { Button, buttonVariants } from '@/components/ui/button'
import { stripHtml } from '@/lib/strip-html'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/modules/favorites'
import { getShowDetailImage, type Show } from '@/modules/shows'
import { ChevronLeftIcon, HeartIcon, PlayIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type ShowDetailHeroProps = {
  show: Show
}

export function ShowDetailHero({ show }: ShowDetailHeroProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite(show.id))
  const imageUrl = getShowDetailImage(show) ?? getShowListImage(show)
  const summary = show.summary ? stripHtml(show.summary) : null
  const metadata = [
    show.status,
    ...(show.genres?.slice(0, 3) ?? []),
    show.rating?.average ? `${show.rating.average.toFixed(1)} rating` : null,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <section className="mx-auto w-full max-w-[1920px] px-4 pt-20 pb-6 sm:px-8 lg:px-12">
      <Link
        to="/"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'mb-4 inline-flex w-fit rounded-full border border-white/25 bg-black/55 shadow-lg shadow-black/20 backdrop-blur-md hover:border-white/40 hover:bg-black/70 md:hidden',
        )}
      >
        <ChevronLeftIcon data-icon="inline-start" />
        Back
      </Link>

      <div className="group relative min-h-104 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 sm:min-h-112 lg:min-h-128">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
            />
            <div className="netflix-hero-gradient absolute inset-0" />
            <div className="netflix-hero-gradient-bottom absolute inset-0" />
          </>
        ) : (
          <div className="from-muted/40 to-background absolute inset-0 bg-linear-to-b" />
        )}

        <div className="relative flex min-h-104 w-full min-w-0 flex-col justify-end px-5 py-8 sm:min-h-112 sm:px-8 lg:min-h-128 lg:max-w-3xl lg:px-12 lg:py-12">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-5xl">{show.name}</h1>
          {metadata ? (
            <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase sm:text-sm">
              {metadata}
            </p>
          ) : null}
          {summary ? (
            <p className="text-foreground/90 mb-6 line-clamp-3 max-w-2xl text-sm leading-relaxed sm:line-clamp-4 sm:text-base">
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
              size="lg"
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
      </div>
    </section>
  )
}
