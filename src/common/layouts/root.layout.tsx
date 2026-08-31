import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-canvas text-foreground">
      <Outlet />
    </div>
  )
}
