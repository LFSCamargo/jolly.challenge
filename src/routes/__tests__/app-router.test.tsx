import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/__tests__/render-app'
import { useFavoritesStore } from '@/modules/favorites'
import { mockEndedShow, mockShow } from '@/modules/shows/__tests__/fixtures/shows.fixture'

describe('app router', () => {
  beforeEach(() => {
    useFavoritesStore.persist.clearStorage()
    useFavoritesStore.setState({ favorites: [] })
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)

      if (url.endsWith('/episodes')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      }

      if (url.includes('/shows/')) {
        return Promise.resolve(new Response(JSON.stringify(mockShow), { status: 200 }))
      }

      return Promise.resolve(
        new Response(JSON.stringify([mockShow, mockEndedShow]), { status: 200 }),
      )
    })
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
    renderApp({ path: '/shows/1' })
    expect(await screen.findByRole('heading', { name: 'Mock Show' })).toBeInTheDocument()
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
