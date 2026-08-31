import { Button } from '@/components/ui/button'
import { ShowStatusBadge } from '@/common/components/show-status-badge'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/modules/favorites'
import { getShowListImage } from '../services/tvmaze.service'
import type { Show } from '../schemas/tvmaze.schema'
import { HeartIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type ShowCardShow = Pick<Show, 'id' | 'name' | 'status' | 'image'>

type ShowCardProps = {
  show: ShowCardShow
  className?: string
}

export function ShowCard({ show, className }: ShowCardProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.isFavorite(show.id))
  const imageUrl = getShowListImage(show as Show)

  return (
    <article className={cn('group flex w-full min-w-0 flex-col', className)}>
      <div className="relative overflow-hidden rounded-md">
        <Link
          to={`/shows/${show.id}`}
          className="ring-offset-background focus-visible:ring-foreground block overflow-hidden rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="bg-muted aspect-2/3 w-full overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${show.name} poster`}
                className="size-full object-cover transition-transform duration-300 group-focus-within:scale-105 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="text-muted-foreground flex size-full items-center justify-center px-2 text-center text-xs">
                No image
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-black via-black/70 to-transparent px-2 pt-8 pb-2">
            <p className="truncate text-sm font-medium">{show.name}</p>
            <ShowStatusBadge status={show.status} />
          </div>
        </Link>
        <Button
          type="button"
          variant={isFavorite ? 'default' : 'secondary'}
          size="icon"
          className="absolute top-2 right-2 size-11 rounded-full bg-black/70"
          aria-label={
            isFavorite
              ? `Remove ${show.name} from favorites`
              : `Add ${show.name} to favorites`
          }
          aria-pressed={isFavorite}
          onClick={() => {
            toggleFavorite(show)
          }}
        >
          <HeartIcon
            data-icon="inline-start"
            className={cn(isFavorite && 'fill-current')}
          />
        </Button>
      </div>
    </article>
  )
}
