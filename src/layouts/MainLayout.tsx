import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useSidebarStore } from '../stores/sidebarStore'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'

export function MainLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const collapsed = useSidebarStore((s) => s.collapsed)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
