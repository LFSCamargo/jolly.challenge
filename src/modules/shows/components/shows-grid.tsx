import type { Show } from '../schemas/tvmaze.schema'
import { ShowCard } from './show-card'

type ShowsGridProps = {
  shows: Show[]
  title: string
}

export function ShowsGrid({ shows, title }: ShowsGridProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {shows.map((show) => (
          <div key={show.id} className="min-w-0">
            <ShowCard show={show} />
          </div>
        ))}
      </div>
    </section>
  )
}
