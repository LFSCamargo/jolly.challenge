import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteShow = {
  id: number
  name: string
  status: string
  imageMedium: string | null
}

type FavoriteInput = {
  id: number
  name: string
  status: string
  image?: { medium?: string | null; original?: string | null } | null
  imageMedium?: string | null
}

type FavoritesState = {
  favorites: FavoriteShow[]
  toggleFavorite: (show: FavoriteInput) => void
  isFavorite: (id: number) => boolean
}

function toFavoriteShow(show: FavoriteInput): FavoriteShow {
  if ('imageMedium' in show && show.imageMedium !== undefined) {
    return {
      id: show.id,
      name: show.name,
      status: show.status,
      imageMedium: show.imageMedium,
    }
  }

  return {
    id: show.id,
    name: show.name,
    status: show.status,
    imageMedium: show.image?.medium ?? null,
  }
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isFavorite: (id) => get().favorites.some((favorite) => favorite.id === id),
      toggleFavorite: (show) => {
        const favorite = toFavoriteShow(show)
        const exists = get().favorites.some((item) => item.id === favorite.id)

        set({
          favorites: exists
            ? get().favorites.filter((item) => item.id !== favorite.id)
            : [...get().favorites, favorite],
        })
      },
    }),
    {
      name: 'show-explorer-favorites',
      partialize: (state) => ({ favorites: state.favorites }),
      skipHydration: import.meta.env.MODE === 'test',
    },
  ),
)
