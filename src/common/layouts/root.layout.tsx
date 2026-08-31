import { AppBottomNav } from '../components/app-bottom-nav'
import { AppHeader } from '../components/app-header'
import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-dvh overflow-x-hidden">
      <AppHeader />
      <Outlet />
      <AppBottomNav />
    </div>
  )
}
