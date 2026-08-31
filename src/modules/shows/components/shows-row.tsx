import type { Show } from '../schemas/tvmaze.schema'
import { ShowCard } from './show-card'

type ShowsRowProps = {
  title: string
  shows: Show[]
}

export function ShowsRow({ title, shows }: ShowsRowProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      <div className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:-mx-8 sm:gap-3 sm:px-8 lg:-mx-12 lg:px-12">
        {shows.map((show) => (
          <div key={show.id} className="w-28 shrink-0 sm:w-32 md:w-36 lg:w-40">
            <ShowCard show={show} />
          </div>
        ))}
      </div>
    </section>
  )
}
