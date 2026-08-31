import { QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { createAppQueryClient } from '@/lib/query-client'
import { appRoutes } from '@/routes'

type RenderAppOptions = {
  path?: string
  routes?: RouteObject[]
} & Omit<RenderOptions, 'wrapper'>

export function renderApp({
  path = '/',
  routes = appRoutes,
  ...options
}: RenderAppOptions = {}) {
  const queryClient = createAppQueryClient()
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  return {
    queryClient,
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
      options,
    ),
  }
}
