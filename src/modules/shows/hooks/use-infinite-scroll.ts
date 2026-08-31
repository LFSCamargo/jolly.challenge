import { useEffect, useRef } from 'react'

export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean,
  hasMore: boolean,
  isLoading: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !hasMore || isLoading) {
      return
    }

    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasMore, isLoading, onLoadMore])

  return sentinelRef
}
