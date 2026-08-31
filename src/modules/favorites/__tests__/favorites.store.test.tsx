import { beforeEach, describe, expect, it } from 'vitest'
import { useFavoritesStore } from '../stores/favorites.store'
import { mockShow } from '@/modules/shows/__tests__/fixtures/shows.fixture'

describe('useFavoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.persist.clearStorage()
    useFavoritesStore.setState({ favorites: [] })
  })

  it('toggles favorites and stores a snapshot', () => {
    expect(useFavoritesStore.getState().isFavorite(mockShow.id)).toBe(false)

    useFavoritesStore.getState().toggleFavorite(mockShow)

    expect(useFavoritesStore.getState().isFavorite(mockShow.id)).toBe(true)
    expect(useFavoritesStore.getState().favorites[0]).toEqual({
      id: mockShow.id,
      name: mockShow.name,
      status: mockShow.status,
      imageMedium: mockShow.image.medium,
    })

    useFavoritesStore.getState().toggleFavorite(mockShow)
    expect(useFavoritesStore.getState().favorites).toHaveLength(0)
  })
})
