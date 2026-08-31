import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from '../hooks/use-debounced-value'

describe('useDebouncedValue', () => {
  it('debounces value updates', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } },
    )

    expect(result.current).toBe('a')

    rerender({ value: 'abc' })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('abc')
    vi.useRealTimers()
  })
})
