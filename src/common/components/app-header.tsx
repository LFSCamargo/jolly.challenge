import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFavoritesStore } from '@/modules/favorites'
import { SearchIcon } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navLinkClass = (isActive: boolean) =>
  cn(
    buttonVariants({ variant: 'ghost', size: 'sm' }),
    'h-11 rounded-full px-4 text-foreground/90 hover:bg-white/10 hover:text-foreground',
    isActive && 'bg-white/15 text-foreground',
  )

export function AppHeader() {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length)
  const location = useLocation()
  const onHome = location.pathname === '/' && location.hash !== '#search'
  const onSearch = location.pathname === '/' && location.hash === '#search'
  const onMyList = location.pathname === '/favorites'

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="mx-auto grid h-16 max-w-[1920px] grid-cols-[1fr_auto] items-center px-4 sm:px-8 md:grid-cols-[1fr_auto_1fr] lg:px-12">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 md:col-start-3 md:justify-self-end"
          >
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-sm text-lg font-black"
            >
              S
            </span>
            <span className="sr-only">Show Explorer home</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:col-start-2 md:row-start-1 md:flex md:items-center md:justify-center md:gap-1"
          >
            <Link
              to={{ pathname: '/', hash: 'search' }}
              className={navLinkClass(onSearch)}
              aria-current={onSearch ? 'page' : undefined}
            >
              <SearchIcon data-icon="inline-start" />
              Search
            </Link>
            <NavLink
              to="/"
              end
              className={() => navLinkClass(onHome)}
              aria-current={onHome ? 'page' : false}
            >
              Home
            </NavLink>
            <NavLink
              to="/favorites"
              className={() => navLinkClass(onMyList)}
              aria-current={onMyList ? 'page' : false}
            >
              My List
              <Badge
                variant="secondary"
                className="text-foreground rounded-full bg-white/15 hover:bg-white/15"
                aria-hidden="true"
              >
                {favoritesCount}
              </Badge>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
