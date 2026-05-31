const API_BASE = '/api'

async function getToken(): Promise<string | null> {
  try {
    const { useAuthStore } = await import('../stores/authStore')
    return useAuthStore.getState().token || localStorage.getItem('token')
  } catch {
    return localStorage.getItem('token')
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options?.headers as Record<string, string> } })

  if (res.status === 401) {
    localStorage.removeItem('token')
    const { useAuthStore } = await import('../stores/authStore')
    useAuthStore.getState().logout()
    window.location.href = '/login'
    throw new Error('Não autorizado')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `Erro ${res.status}`)
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
