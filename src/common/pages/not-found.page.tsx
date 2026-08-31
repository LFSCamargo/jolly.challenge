import { buttonVariants } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg items-center overflow-x-hidden px-4 pt-20 pb-24 sm:px-6 md:pb-8">
      <Empty className="border-border w-full border">
        <EmptyHeader>
          <h1 className="font-heading text-sm font-medium tracking-tight">
            Page not found
          </h1>
          <EmptyDescription>
            That route does not exist. Head back to browse TV shows.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to="/" className={cn(buttonVariants())}>
            Back to shows
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  )
}
