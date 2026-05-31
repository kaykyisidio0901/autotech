import { useState } from 'react'
import { mockMovimentacoes } from '../mock/movimentacoes'
import { mockProdutos } from '../mock/produtos'
import { createMovimentacao } from '../services/estoque'
import type { MovimentoTipo } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { Pagination } from '../components/ui/Pagination'
import { formatDate } from '../utils/format'
import { useAuthStore } from '../stores/authStore'

const tipoLabel: Record<MovimentoTipo, string> = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' }
const tipoVariant: Record<MovimentoTipo, 'success' | 'danger' | 'warning'> = { entrada: 'success', saida: 'danger', ajuste: 'warning' }

export function Movimentacoes() {
  const user = useAuthStore((s) => s.user)
  const [movs, setMovs] = useState(mockMovimentacoes)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ produtoId: 0, tipo: 'entrada' as MovimentoTipo, quantidade: 1, observacao: '' })
  const pageSize = 10

  const filtered = movs.filter(
    (m) => m.produtoNome.toLowerCase().includes(search.toLowerCase()) || m.tipo.toLowerCase().includes(search.toLowerCase()) || m.responsavel.toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.produtoId || form.quantidade <= 0) return
    const prod = mockProdutos.find((p) => p.id === form.produtoId)
    if (!prod) return
    const qtd = form.tipo === 'saida' ? form.quantidade : form.tipo === 'ajuste' ? form.quantidade : form.quantidade
    const mov = await createMovimentacao({
      produtoId: form.produtoId, produtoNome: prod.nome, tipo: form.tipo,
      quantidade: qtd, data: new Date().toISOString().split('T')[0],
      observacao: form.observacao, responsavel: user?.nome ?? 'Sistema',
    })
    setMovs((prev) => [mov, ...prev])
    setModalOpen(false)
    setForm({ produtoId: 0, tipo: 'entrada', quantidade: 1, observacao: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Movimentações</h1>
          <p className="text-sm text-gray-500 mt-1">Entradas, saídas e ajustes de estoque</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Nova Movimentação</Button>
      </div>

      <div className="max-w-sm">
        <input type="text" placeholder="Buscar movimentação..." className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Data</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Produto</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Tipo</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Quantidade</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Observação</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((m) => (
                <tr key={m.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{formatDate(m.data)}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{m.produtoNome}</td>
                  <td className="px-4 py-3"><BadgeStatus label={tipoLabel[m.tipo]} variant={tipoVariant[m.tipo]} /></td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-medium ${m.tipo === 'entrada' ? 'text-green-400' : m.tipo === 'saida' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {m.tipo === 'entrada' ? '+' : ''}{m.quantidade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{m.observacao || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{m.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} /></div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Movimentação" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Produto</label>
            <select className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: Number(e.target.value) })} required>
              <option value={0}>Selecione...</option>
              {mockProdutos.filter((p) => p.status).map((p) => (
                <option key={p.id} value={p.id}>{p.nome} (estoque: {p.quantidade})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Tipo</label>
              <select className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as MovimentoTipo })}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="ajuste">Ajuste Manual</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Quantidade</label>
              <input type="number" min={1} className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Observação</label>
            <input type="text" className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Observação opcional" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
