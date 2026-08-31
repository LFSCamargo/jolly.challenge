import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useHomeEnterTransition } from '../hooks/use-home-enter-transition'

function TransitionProbe() {
  const isEnteringFromSearch = useHomeEnterTransition()
  const navigate = useNavigate()

  return (
    <>
      <span data-testid="enter">{String(isEnteringFromSearch)}</span>
      <button type="button" onClick={() => navigate('/')}>
        Go home
      </button>
    </>
  )
}

describe('useHomeEnterTransition', () => {
  it('activates when navigating from search to home', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<TransitionProbe />} />
          <Route path="/" element={<TransitionProbe />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('enter')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: 'Go home' }))

    expect(screen.getByTestId('enter')).toHaveTextContent('true')
  })
})
