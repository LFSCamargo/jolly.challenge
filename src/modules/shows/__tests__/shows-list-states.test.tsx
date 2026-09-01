import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ShowsListStates } from '../components/shows-list-states'

describe('ShowsListStates', () => {
  it('renders a browse skeleton with row and grid placeholders', () => {
    render(
      <ShowsListStates
        isInitialLoading
        isError={false}
        isEmpty={false}
        isSearchActive={false}
        statusFilterLabel="All"
        skeletonVariant="browse"
        onRetry={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Loading shows')).toBeInTheDocument()
    expect(screen.getByLabelText('Loading shows').querySelectorAll('.aspect-2\\/3')).toHaveLength(
      20,
    )
  })

  it('renders a search results grid skeleton', () => {
    render(
      <ShowsListStates
        isInitialLoading
        isError={false}
        isEmpty={false}
        isSearchActive
        statusFilterLabel="All"
        skeletonVariant="search"
        onRetry={() => undefined}
      />,
    )

    expect(screen.getByLabelText('Loading search results')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Loading search results').querySelectorAll('.aspect-2\\/3'),
    ).toHaveLength(12)
  })
})
