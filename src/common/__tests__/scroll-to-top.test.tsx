import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from '../components/scroll-to-top'

function GoSearchButton() {
  const navigate = useNavigate()

  return (
    <button type="button" onClick={() => navigate('/search')}>
      Go search
    </button>
  )
}

describe('ScrollToTop', () => {
  it('scrolls to the top when the pathname changes', () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)

    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<GoSearchButton />} />
          <Route path="/search" element={<div>Search</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(scrollTo).toHaveBeenCalledWith(0, 0)

    scrollTo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Go search' }))

    expect(scrollTo).toHaveBeenCalledWith(0, 0)

    vi.unstubAllGlobals()
  })
})
