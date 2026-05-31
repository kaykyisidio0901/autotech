import { useState } from 'react'
import { mockCategorias } from '../mock/categorias'
import { createCategoria, updateCategoria, deleteCategoria } from '../services/categorias'
import type { Categoria } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { useAuthStore } from '../stores/authStore'

export function Categorias() {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'proprietario' || user?.role === 'gerente'
  const [categorias, setCategorias] = useState(mockCategorias)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [form, setForm] = useState({ nome: '', descricao: '' })

  const filtered = categorias.filter(
    (c) => c.nome.toLowerCase().includes(search.toLowerCase()) || c.descricao.toLowerCase().includes(search.toLowerCase())
  )

  function openNew() {
    setEditing(null)
    setForm({ nome: '', descricao: '' })
    setModalOpen(true)
  }

  function openEdit(cat: Categoria) {
    setEditing(cat)
    setForm({ nome: cat.nome, descricao: cat.descricao })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nome.trim()) return
    if (editing) {
      const updated = await updateCategoria(editing.id, { ...form, ativo: editing.ativo })
      setCategorias((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    } else {
      const created = await createCategoria({ ...form, ativo: true })
      setCategorias((prev) => [...prev, created])
    }
    setModalOpen(false)
  }

  async function handleDelete(id: number) {
    await deleteCategoria(id)
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Categorias</h1>
          <p className="text-sm text-gray-500 mt-1">Gerenciamento de categorias de produtos</p>
        </div>
        {canEdit && <Button onClick={openNew}>+ Nova Categoria</Button>}
      </div>

      <div className="max-w-sm">
        <input
          type="text"
          placeholder="Buscar categoria..."
          className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600">
              <th className="text-left text-gray-500 font-medium px-4 py-3">Nome</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Descrição</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
              {canEdit && <th className="text-right text-gray-500 font-medium px-4 py-3">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat) => (
              <tr key={cat.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                <td className="px-4 py-3 text-gray-200 font-medium">{cat.nome}</td>
                <td className="px-4 py-3 text-gray-400">{cat.descricao}</td>
                <td className="px-4 py-3"><BadgeStatus label={cat.ativo ? 'Ativo' : 'Inativo'} variant={cat.ativo ? 'success' : 'muted'} /></td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEdit(cat)}>Editar</Button>
                      <Button variant="ghost" className="!px-2 !py-1 text-xs text-red-400" onClick={() => setConfirmDelete(cat.id)}>Excluir</Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria'} size="sm">
        <div className="space-y-4">
          <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome da categoria" />
          <Input label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nome.trim()}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete) }} title="Excluir Categoria" message="Tem certeza que deseja excluir esta categoria?" />
    </div>
  )
}
