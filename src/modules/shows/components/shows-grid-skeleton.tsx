import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type ShowsGridSkeletonProps = {
  titleWidthClassName?: string
  cardCount?: number
}

export function ShowsGridSkeleton({
  titleWidthClassName = 'w-28',
  cardCount = 12,
}: ShowsGridSkeletonProps) {
  return (
    <section aria-hidden="true" className="flex min-w-0 flex-col gap-3">
      <Skeleton className={cn('h-6', titleWidthClassName)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Skeleton key={index} className="aspect-2/3 w-full rounded-md" />
        ))}
      </div>
    </section>
  )
}
