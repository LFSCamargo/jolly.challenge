import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from './app/providers'
import { router } from './routes'
import './styles/index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>,
)
