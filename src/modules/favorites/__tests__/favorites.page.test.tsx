import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderApp } from '@/__tests__/render-app'
import { useFavoritesStore } from '../stores/favorites.store'
import { mockShow } from '@/modules/shows/__tests__/fixtures/shows.fixture'

describe('FavoritesPage', () => {
  beforeEach(() => {
    useFavoritesStore.persist.clearStorage()
    useFavoritesStore.setState({ favorites: [] })
  })

  it('renders an empty state when there are no favorites', () => {
    renderApp({ path: '/favorites' })

    expect(screen.getByRole('heading', { name: 'My List' })).toBeInTheDocument()
    expect(screen.getByText('Your list is empty')).toBeInTheDocument()
  })

  it('renders saved favorites', () => {
    useFavoritesStore.setState({
      favorites: [
        {
          id: mockShow.id,
          name: mockShow.name,
          status: mockShow.status,
          imageMedium: mockShow.image.medium,
        },
      ],
    })

    renderApp({ path: '/favorites' })

    expect(screen.getByRole('img', { name: 'Mock Show poster' })).toBeInTheDocument()
  })
})
