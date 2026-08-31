import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { ShowCard } from '@/modules/shows'
import { Link } from 'react-router-dom'

import { useFavoritesStore } from '../stores/favorites.store'

export function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites)

  return (
    <main className="mx-auto flex w-full max-w-[1920px] min-w-0 flex-col gap-6 overflow-x-hidden px-4 pt-20 pb-24 sm:px-8 md:pb-8 lg:px-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My List</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Shows you saved stay here across reloads.
        </p>
      </div>

      {favorites.length === 0 ? (
        <Empty className="border-border border-white/10 bg-white/5">
          <EmptyHeader>
            <EmptyTitle>Your list is empty</EmptyTitle>
            <EmptyDescription>
              Browse shows and tap the heart icon to build your list.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link to="/" className={cn(buttonVariants(), 'rounded-full')}>
              Browse shows
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wide">
            Saved Shows
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="min-w-0">
                <ShowCard
                  show={{
                    id: favorite.id,
                    name: favorite.name,
                    status: favorite.status,
                    image: favorite.imageMedium
                      ? { medium: favorite.imageMedium, original: favorite.imageMedium }
                      : null,
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
