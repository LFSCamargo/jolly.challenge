import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from '../common/layouts/root.layout'
import { NotFoundPage } from '../common/pages/not-found.page'
import { FavoritesPage } from '../modules/favorites'
import { ShowDetailPage } from '../modules/show-detail'
import { ShowsPage } from '../modules/shows'

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <ShowsPage /> },
      { path: '/shows/:showId', element: <ShowDetailPage /> },
      { path: '/favorites', element: <FavoritesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(appRoutes)
