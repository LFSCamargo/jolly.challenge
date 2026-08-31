import { appMeta } from '../schemas/app-meta.schema'

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16">
      <p className="bg-muted text-muted-foreground rounded-full px-4 py-1 text-sm font-medium">
        Jolly Challenge
      </p>
      <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl">
        {appMeta.title}
      </h1>
      <p className="text-muted-foreground max-w-xl text-center text-lg">
        React, TypeScript, Vite, Tailwind, Vitest, and Cursor AI rules are configured.{' '}
        {appMeta.tagline}
      </p>
    </main>
  )
}
