import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '../common/layouts/root.layout'
import { HomePage } from '../modules/home/routes'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [{ path: '/', element: <HomePage /> }],
  },
])
