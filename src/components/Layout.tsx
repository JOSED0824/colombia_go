import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="app-shell">
      <div className="leaf-bg" aria-hidden="true" />
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
