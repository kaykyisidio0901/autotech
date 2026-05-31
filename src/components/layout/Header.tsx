import { useSidebarStore } from '../../stores/sidebarStore'
import { useAuthStore } from '../../stores/authStore'

export function Header() {
  const toggle = useSidebarStore((s) => s.toggle)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="h-16 bg-dark-900 border-b border-dark-600 flex items-center justify-between px-6 sticky top-0 z-20">
      <button
        onClick={toggle}
        className="text-gray-400 hover:text-gray-200 text-xl p-1 rounded-lg hover:bg-dark-700 transition-all"
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-200 font-medium">{user?.nome}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-semibold">
          {user?.nome.charAt(0)}
        </div>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
