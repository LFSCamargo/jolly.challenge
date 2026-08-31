import { useEffect, useRef } from 'react'

export function useInfiniteScroll(
  onLoadMore: () => void,
  enabled: boolean,
  hasMore: boolean,
  isLoading: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    if (!enabled || !hasMore || isLoading) {
      return
    }

    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    let requested = false
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting && !requested) {
          requested = true
          observer.unobserve(sentinel)
          onLoadMoreRef.current()
        }
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasMore, isLoading])

  return sentinelRef
}
