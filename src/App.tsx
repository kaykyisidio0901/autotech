import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { useAuthStore } from './stores/authStore'

function AuthInit({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])
  return <>{children}</>
}

export default function App() {
  return (
    <AuthInit>
      <RouterProvider router={router} />
    </AuthInit>
  )
}
