import { Skeleton } from '@/components/ui/skeleton'

type ShowsRowSkeletonProps = {
  cardCount?: number
}

export function ShowsRowSkeleton({ cardCount = 8 }: ShowsRowSkeletonProps) {
  return (
    <section aria-hidden="true" className="flex min-w-0 flex-col gap-3">
      <Skeleton className="h-6 w-40" />
      <div className="-mx-4 flex scrollbar-none gap-2 overflow-x-hidden px-4 sm:-mx-8 sm:gap-3 sm:px-8 lg:-mx-12 lg:px-12">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div
            key={index}
            className="w-28 shrink-0 sm:w-32 md:w-36 lg:w-40"
          >
            <Skeleton className="aspect-2/3 w-full rounded-md" />
          </div>
        ))}
      </div>
    </section>
  )
}
