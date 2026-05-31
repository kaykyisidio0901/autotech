import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { User, UserRole } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuthStore } from '../stores/authStore'

export function Users() {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<User[]>('/users')
        setUsers(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const isOwner = currentUser?.role === 'proprietario'

  const roleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      proprietario: 'bg-purple-500/20 text-purple-400',
      gerente: 'bg-amber-500/20 text-amber-400',
      funcionario: 'bg-blue-500/20 text-blue-400',
    }
    const labels: Record<UserRole, string> = {
      proprietario: 'Proprietário',
      gerente: 'Gerente',
      funcionario: 'Funcionário',
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Usuários</h1>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento de acesso ao sistema</p>
        </div>
        {isOwner && (
          <Button onClick={() => setShowModal(true)}>
            + Novo Usuário
          </Button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Nome</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">E-mail</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Perfil</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                {isOwner && <th className="text-right text-gray-500 font-medium px-4 py-3">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-200 font-medium">{user.nome}</td>
                  <td className="px-4 py-3 text-gray-400">{user.email}</td>
                  <td className="px-4 py-3">{roleBadge(user.role)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.ativo
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" className="text-xs !px-2 !py-1">
                          Editar
                        </Button>
                        <Button variant="ghost" className="text-xs !px-2 !py-1 text-red-400 hover:text-red-300">
                          Excluir
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Novo Usuário</h2>
            <p className="text-sm text-gray-500 mb-4">
              Funcionalidade disponível na integração com API.
            </p>
            <Button fullWidth variant="secondary" onClick={() => setShowModal(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
