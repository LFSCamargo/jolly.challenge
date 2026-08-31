import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../pages/home.page'

describe('HomePage', () => {
  it('renders the challenge heading', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { name: /frontend starter is ready/i }),
    ).toBeInTheDocument()
  })
})
