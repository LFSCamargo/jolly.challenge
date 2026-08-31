import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { isDesktopViewport } from '@/common/utils/viewport'
import { useFavoritesStore } from '@/modules/favorites'
import { SearchIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const navLinkClass = (isActive: boolean) =>
  cn(
    buttonVariants({ variant: 'ghost', size: 'sm' }),
    'h-11 rounded-full px-4 text-foreground/90 hover:bg-white/10 hover:text-foreground',
    isActive && 'bg-white/15 text-foreground backdrop-blur-lg',
  )

export function AppHeader() {
  const favoritesCount = useFavoritesStore((state) => state.favorites.length)
  const location = useLocation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const onHome = location.pathname === '/'
  const onSearch = location.pathname === '/search'
  const onMyList = location.pathname === '/favorites'
  const currentQuery = onSearch
    ? (new URLSearchParams(location.search).get('q') ?? '')
    : ''
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(currentQuery)

  useEffect(() => {
    if (onSearch) {
      setSearchQuery(currentQuery)

      if (isDesktopViewport()) {
        setIsSearchOpen(true)
      }
      return
    }

    setIsSearchOpen(false)
  }, [currentQuery, onSearch])

  useEffect(() => {
    if (isSearchOpen && isDesktopViewport() && onSearch) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen, onSearch])

  const openSearch = () => {
    setIsSearchOpen(true)

    if (onSearch) {
      return
    }

    const trimmedQuery = searchQuery.trim()
    const queryString = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : ''
    void navigate(`/search${queryString}`)
  }

  const exitSearchToHome = () => {
    setIsSearchOpen(false)
    void navigate('/', { replace: true })
  }

  const updateSearch = (value: string) => {
    setSearchQuery(value)

    const params = onSearch ? new URLSearchParams(location.search) : new URLSearchParams()

    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }

    if (!value && !onSearch) {
      return
    }

    const queryString = params.toString()
    void navigate(`/search${queryString ? `?${queryString}` : ''}`, {
      replace: true,
    })
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto bg-linear-to-b from-black via-black/80 to-transparent">
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
            {isSearchOpen ? (
              <form
                role="search"
                className="animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
                onSubmit={(event) => {
                  event.preventDefault()
                }}
              >
                <InputGroup className="h-11 w-[min(42vw,24rem)] rounded-full border-white/25 bg-black/55 shadow-lg shadow-black/30 backdrop-blur-lg transition-[width,border-color,box-shadow,background-color] duration-300 focus-within:w-[min(46vw,28rem)] focus-within:border-white/50 focus-within:bg-black/70 motion-reduce:transition-none">
                  <InputGroupInput
                    ref={inputRef}
                    aria-label="Search titles, genres, and keywords"
                    placeholder="Titles, genres, keywords"
                    value={searchQuery}
                    onChange={(event) => {
                      updateSearch(event.target.value)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        exitSearchToHome()
                      }
                    }}
                  />
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-sm"
                      aria-label="Close search"
                      onClick={exitSearchToHome}
                    >
                      <XIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={navLinkClass(onSearch)}
                aria-current={onSearch ? 'page' : undefined}
                aria-label="Open search"
                onClick={openSearch}
              >
                <SearchIcon data-icon="inline-start" />
                Search
              </Button>
            )}
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
