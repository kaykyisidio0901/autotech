import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { User, UserRole } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuthStore } from '../stores/authStore'

export function Users() {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'funcionario' as UserRole, telefone: '', cargo: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  async function handleSave() {
    if (!form.nome.trim() || !form.email.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload: any = { nome: form.nome, email: form.email, role: form.role, telefone: form.telefone, cargo: form.cargo }
      if (form.senha) payload.senha = form.senha
      await api.post('/users', payload)
      setShowModal(false)
      setForm({ nome: '', email: '', senha: '', role: 'funcionario', telefone: '', cargo: '' })
      setUsers(await api.get<User[]>('/users'))
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar usuário')
    } finally {
      setSaving(false)
    }
  }

  const isOwner = currentUser?.role === 'admin' || currentUser?.role === 'proprietario'

  const roleBadge = (role: UserRole) => {
    const styles: Record<UserRole, string> = {
      admin: 'bg-purple-500/20 text-purple-400',
      proprietario: 'bg-purple-500/20 text-purple-400',
      gerente: 'bg-amber-500/20 text-amber-400',
      funcionario: 'bg-blue-500/20 text-blue-400',
    }
    const labels: Record<UserRole, string> = {
      admin: 'Proprietário',
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { if (!saving) setShowModal(false) }}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-100">Novo Usuário</h2>
            <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            <Input label="Senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Deixe em branco para 123456" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Perfil</label>
              <select className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
                <option value="funcionario">Funcionário</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Proprietário</option>
              </select>
            </div>
            <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            <Input label="Cargo" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Ex: Vendedor" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !form.nome.trim() || !form.email.trim()}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
