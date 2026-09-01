import { Skeleton } from '@/components/ui/skeleton'

export function ShowsHeroSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="relative min-h-104 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 sm:min-h-112 lg:min-h-128"
    >
      <Skeleton className="absolute inset-0 size-full rounded-none" />
      <div className="relative flex min-h-104 w-full min-w-0 flex-col justify-end px-5 py-8 sm:min-h-112 sm:px-8 lg:min-h-128 lg:max-w-3xl lg:px-12 lg:py-12">
        <Skeleton className="mb-3 h-5 w-20 rounded-full" />
        <Skeleton className="mb-3 h-10 w-full max-w-md sm:h-12" />
        <Skeleton className="mb-4 h-4 w-56 max-w-full" />
        <Skeleton className="mb-6 h-14 w-full max-w-xl" />
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 w-full rounded-full sm:w-32" />
          <Skeleton className="h-12 w-full rounded-full sm:w-36" />
        </div>
      </div>
    </section>
  )
}
