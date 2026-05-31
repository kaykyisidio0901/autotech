import { useState, useEffect, useCallback } from 'react'
import { fetchFornecedores, createFornecedor, updateFornecedor, deleteFornecedor } from '../services/fornecedores'
import type { Fornecedor } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { Pagination } from '../components/ui/Pagination'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useAuthStore } from '../stores/authStore'

const emptyForm = {
  razaoSocial: '', nomeFantasia: '', cnpj: '', telefone: '', whatsapp: '', email: '', endereco: '',
}

export function Fornecedores() {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'proprietario' || user?.role === 'gerente'
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editing, setEditing] = useState<Fornecedor | null>(null)
  const [form, setForm] = useState(emptyForm)
  const pageSize = 5

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFornecedores()
        setFornecedores(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = fornecedores.filter(
    (f) =>
      f.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
      f.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
      f.cnpj.includes(search)
  )
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function openNew() {
    setEditing(null); setForm(emptyForm); setModalOpen(true)
  }

  function openEdit(f: Fornecedor) {
    setEditing(f)
    setForm({ razaoSocial: f.razaoSocial, nomeFantasia: f.nomeFantasia, cnpj: f.cnpj, telefone: f.telefone, whatsapp: f.whatsapp, email: f.email, endereco: f.endereco })
    setModalOpen(true)
  }

  const handleSave = useCallback(async () => {
    if (!form.razaoSocial.trim() || !form.cnpj.trim()) return
    if (editing) {
      const updated = await updateFornecedor(editing.id, { ...form, ativo: editing.ativo })
      setFornecedores((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } else {
      const created = await createFornecedor({ ...form, ativo: true })
      setFornecedores((prev) => [...prev, created])
    }
    setModalOpen(false)
  }, [form, editing])

  const handleDelete = useCallback(async (id: number) => {
    await deleteFornecedor(id)
    setFornecedores((prev) => prev.filter((f) => f.id !== id))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento de fornecedores</p>
        </div>
        {canEdit && <Button onClick={openNew}>+ Novo Fornecedor</Button>}
      </div>

      <div className="max-w-sm">
        <input
          type="text"
          placeholder="Buscar fornecedor..."
          className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left text-gray-500 font-medium px-4 py-3">Razão Social</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Fantasia</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">CNPJ</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Telefone</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
              {canEdit && <th className="text-right text-gray-500 font-medium px-4 py-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((f) => (
              <tr key={f.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                <td className="px-4 py-3 text-gray-200 font-medium">{f.razaoSocial}</td>
                <td className="px-4 py-3 text-gray-400">{f.nomeFantasia}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{f.cnpj}</td>
                <td className="px-4 py-3 text-gray-400">{f.telefone}</td>
                <td className="px-4 py-3"><BadgeStatus label={f.ativo ? 'Ativo' : 'Inativo'} variant={f.ativo ? 'success' : 'muted'} /></td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEdit(f)}>Editar</Button>
                      <Button variant="ghost" className="!px-2 !py-1 text-xs text-red-400" onClick={() => setConfirmDelete(f.id)}>Excluir</Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 pb-4">
          <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Fornecedor' : 'Novo Fornecedor'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Razão Social" value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
            <Input label="Nome Fantasia" value={form.nomeFantasia} onChange={(e) => setForm({ ...form, nomeFantasia: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="CNPJ" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
          <Input label="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.razaoSocial.trim() || !form.cnpj.trim()}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete) }} title="Excluir Fornecedor" message="Tem certeza que deseja excluir este fornecedor?" />
    </div>
  )
}
