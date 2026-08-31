import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { useFavoritesStore } from '@/modules/favorites/stores/favorites.store'

class IntersectionObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})

afterEach(() => {
  cleanup()
  useFavoritesStore.persist.clearStorage()
  useFavoritesStore.setState({ favorites: [] })
})
