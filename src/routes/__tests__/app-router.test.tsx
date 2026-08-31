import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { installTvmazeFetchMock, tvmazeTestLabels } from '@/__tests__/mock-tvmaze-fetch'
import { renderApp } from '@/__tests__/render-app'
import { useFavoritesStore } from '@/modules/favorites'

describe('app router', () => {
  beforeEach(() => {
    useFavoritesStore.persist.clearStorage()
    useFavoritesStore.setState({ favorites: [] })
    installTvmazeFetchMock()
  })

  it('renders the shows list at /', async () => {
    renderApp({ path: '/' })
    expect(await screen.findByLabelText('Search shows')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Your Next Watch' }),
    ).toBeInTheDocument()
  })

  it('renders favorites at /favorites', () => {
    renderApp({ path: '/favorites' })
    expect(screen.getByRole('heading', { name: 'My List' })).toBeInTheDocument()
  })

  it('renders show detail at /shows/:showId', async () => {
    renderApp({ path: `/shows/${tvmazeTestLabels.detailShowId}` })
    expect(
      await screen.findByRole('heading', { name: tvmazeTestLabels.detailShowName }),
    ).toBeInTheDocument()
  })

  it('renders not found for unknown paths', () => {
    renderApp({ path: '/not-a-page' })
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('navigates between shows and favorites from the header', async () => {
    const { router } = renderApp({ path: '/' })

    expect(await screen.findByLabelText('Search shows')).toBeInTheDocument()
    const myListLinks = screen.getAllByRole('link', { name: /^my list$/i })
    expect(myListLinks.length).toBeGreaterThan(0)
    for (const link of myListLinks) {
      expect(link).toHaveAttribute('href', '/favorites')
    }

    await router.navigate('/favorites')

    expect(await screen.findByRole('heading', { name: 'My List' })).toBeInTheDocument()

    await router.navigate('/')

    expect(await screen.findByLabelText('Search shows')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Your Next Watch' }),
    ).toBeInTheDocument()
  })
})
