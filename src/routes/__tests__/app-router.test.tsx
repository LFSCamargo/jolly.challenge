import { fireEvent, screen, waitFor } from '@testing-library/react'
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
    expect(screen.queryByLabelText('Search shows')).not.toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Your Next Watch' }),
    ).toBeInTheDocument()
  })

  it('renders the dedicated search page at /search', () => {
    renderApp({ path: '/search' })
    expect(screen.getByRole('heading', { name: 'Search shows' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search shows')).toBeInTheDocument()
  })

  it('expands desktop search from the header and opens search results', async () => {
    const { router } = renderApp({ path: '/' })

    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))

    const headerSearch = screen.getByLabelText('Search titles, genres, and keywords')
    expect(headerSearch).toHaveFocus()

    fireEvent.change(headerSearch, {
      target: { value: 'b' },
    })

    await waitFor(() => {
      expect(headerSearch).toHaveValue('b')
      expect(router.state.location.pathname).toBe('/search')
      expect(router.state.location.search).toBe('?q=b')
    })

    fireEvent.change(headerSearch, {
      target: { value: 'br' },
    })

    await waitFor(() => {
      expect(headerSearch).toHaveValue('br')
      expect(router.state.location.search).toBe('?q=br')
    })

    fireEvent.change(headerSearch, {
      target: { value: tvmazeTestLabels.searchQuery },
    })

    await waitFor(() => {
      expect(headerSearch).toHaveValue(tvmazeTestLabels.searchQuery)
      expect(router.state.location.pathname).toBe('/search')
      expect(router.state.location.search).toBe(`?q=${tvmazeTestLabels.searchQuery}`)
    })
  })

  it('stays on search when desktop query is cleared', async () => {
    const { router } = renderApp({ path: `/search?q=${tvmazeTestLabels.searchQuery}` })

    const headerSearch = screen.getByLabelText('Search titles, genres, and keywords')

    fireEvent.change(headerSearch, {
      target: { value: '' },
    })

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search')
      expect(router.state.location.search).toBe('')
    })

    expect(headerSearch).toHaveValue('')
    expect(screen.getByRole('heading', { name: 'Search shows' })).toBeInTheDocument()
  })

  it('returns home when desktop search is closed from the search page', async () => {
    const { router } = renderApp({ path: `/search?q=${tvmazeTestLabels.searchQuery}` })

    fireEvent.click(screen.getByRole('button', { name: 'Close search' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
      expect(router.state.location.search).toBe('')
    })

    expect(
      await screen.findByRole('heading', { name: 'Your Next Watch' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Search titles, genres, and keywords')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))

    expect(screen.getByLabelText('Search titles, genres, and keywords')).toHaveValue(
      tvmazeTestLabels.searchQuery,
    )
  })

  it('collapses desktop search when navigating away and keeps the query', async () => {
    renderApp({ path: `/search?q=${tvmazeTestLabels.searchQuery}` })

    expect(screen.getByLabelText('Search titles, genres, and keywords')).toHaveValue(
      tvmazeTestLabels.searchQuery,
    )

    fireEvent.click(screen.getByRole('navigation', { name: 'Primary' }).querySelector('a[href="/"]')!)

    await waitFor(() => {
      expect(screen.queryByLabelText('Search titles, genres, and keywords')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Open search' }))

    expect(screen.getByLabelText('Search titles, genres, and keywords')).toHaveValue(
      tvmazeTestLabels.searchQuery,
    )
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

    expect(
      await screen.findByRole('heading', { name: 'Your Next Watch' }),
    ).toBeInTheDocument()
    const myListLinks = screen.getAllByRole('link', { name: /^my list$/i })
    expect(myListLinks.length).toBeGreaterThan(0)
    for (const link of myListLinks) {
      expect(link).toHaveAttribute('href', '/favorites')
    }

    await router.navigate('/favorites')

    expect(await screen.findByRole('heading', { name: 'My List' })).toBeInTheDocument()

    await router.navigate('/')

    expect(screen.queryByLabelText('Search shows')).not.toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Your Next Watch' }),
    ).toBeInTheDocument()
  })
})
