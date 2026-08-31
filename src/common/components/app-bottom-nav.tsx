import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/modules/favorites'
import { HeartIcon, HouseIcon, SearchIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const itemClass = (isActive: boolean) =>
  cn(
    buttonVariants({ variant: 'ghost', size: 'sm' }),
    'h-11 min-w-11 flex-1 flex-col gap-0.5 rounded-none text-[0.65rem] font-medium',
    isActive ? 'text-primary' : 'text-muted-foreground',
  )

export function AppBottomNav() {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length)
  const location = useLocation()
  const onHome = location.pathname === '/'
  const onSearch = location.pathname === '/search'
  const onMyList = location.pathname === '/favorites'

  return (
    <nav
      aria-label="Mobile"
      className="border-border/80 bg-background/90 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md md:hidden"
    >
      <div className="flex items-stretch pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <NavLink
          to="/"
          end
          className={() => itemClass(onHome)}
          aria-current={onHome ? 'page' : false}
        >
          <HouseIcon />
          Home
        </NavLink>
        <NavLink
          to="/search"
          className={itemClass(onSearch)}
          aria-current={onSearch ? 'page' : undefined}
        >
          <SearchIcon />
          Search
        </NavLink>
        <NavLink
          to="/favorites"
          className={() => itemClass(onMyList)}
          aria-current={onMyList ? 'page' : false}
        >
          <span className="relative">
            <HeartIcon />
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-3 min-w-4 px-1 py-0 text-[0.6rem]"
              aria-hidden="true"
            >
              {favoritesCount}
            </Badge>
          </span>
          My List
        </NavLink>
      </div>
    </nav>
  )
}
