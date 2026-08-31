import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Outlet />
    </div>
  )
}
