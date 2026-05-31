import { useState, useEffect, useMemo } from 'react'
import { fetchVendas, cancelVenda } from '../services/vendas'
import type { Venda, FormaPagamento, VendaStatus } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { Pagination } from '../components/ui/Pagination'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import { ReceiptModal } from '../components/receipt/ReceiptModal'

const formaPagamentoLabel: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro', cartao_credito: 'Cartão de Crédito', cartao_debito: 'Cartão de Débito', pix: 'Pix', boleto: 'Boleto',
}
const statusLabel: Record<VendaStatus, string> = { concluida: 'Concluída', cancelada: 'Cancelada', pendente: 'Pendente' }
const statusVariant: Record<VendaStatus, 'success' | 'danger' | 'warning'> = { concluida: 'success', cancelada: 'danger', pendente: 'warning' }

type PeriodFilter = 'hoje' | 'semana' | 'mes' | 'personalizado'

function getPeriodDates(period: PeriodFilter): [string, string] {
  const today = new Date()
  const end = today.toISOString().split('T')[0]
  if (period === 'hoje') return [end, end]
  if (period === 'semana') {
    const start = new Date(today)
    start.setDate(start.getDate() - 7)
    return [start.toISOString().split('T')[0], end]
  }
  if (period === 'mes') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return [start.toISOString().split('T')[0], end]
  }
  return ['', '']
}

export function HistoricoVendas() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<PeriodFilter>('mes')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [page, setPage] = useState(1)
  const [receiptVenda, setReceiptVenda] = useState<Venda | null>(null)
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)
  const [viewVenda, setViewVenda] = useState<Venda | null>(null)
  const [loading, setLoading] = useState(true)
  const pageSize = 10

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchVendas()
        setVendas(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const [pdStart, pdEnd] = period === 'personalizado' ? [dateStart, dateEnd] : getPeriodDates(period)
    return vendas.filter((v) => {
      const matchSearch = v.cliente.toLowerCase().includes(search.toLowerCase()) || String(v.id).includes(search) || v.vendedor.toLowerCase().includes(search.toLowerCase())
      const matchDate = !pdStart || !pdEnd || (v.data >= pdStart && v.data <= pdEnd)
      return matchSearch && matchDate
    })
  }, [vendas, search, period, dateStart, dateEnd])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function handleCancel(id: number) {
    await cancelVenda(id)
    setVendas((prev) => prev.map((v) => v.id === id ? { ...v, status: 'cancelada' as const } : v))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Histórico de Vendas</h1>
        <p className="text-sm text-gray-500 mt-1">Consulte vendas realizadas</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por ID, cliente ou vendedor..."
            className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
          value={period}
          onChange={(e) => { setPeriod(e.target.value as PeriodFilter); setPage(1) }}
        >
          <option value="hoje">Hoje</option>
          <option value="semana">Últimos 7 dias</option>
          <option value="mes">Este mês</option>
          <option value="personalizado">Personalizado</option>
        </select>
        {period === 'personalizado' && (
          <>
            <input type="date" className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            <span className="text-gray-500">até</span>
            <input type="date" className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Venda</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Cliente</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Data</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Valor</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Pagamento</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Vendedor</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-right text-gray-500 font-medium px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((venda) => (
                <tr key={venda.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{String(venda.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{venda.cliente}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(venda.data)}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{formatCurrency(venda.total)}</td>
                  <td className="px-4 py-3 text-gray-400">{formaPagamentoLabel[venda.formaPagamento]}{venda.parcelas > 1 ? ` (${venda.parcelas}x)` : ''}</td>
                  <td className="px-4 py-3 text-gray-400">{venda.vendedor}</td>
                  <td className="px-4 py-3"><BadgeStatus label={statusLabel[venda.status]} variant={statusVariant[venda.status]} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => setViewVenda(venda)}>Detalhes</Button>
                      <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => setReceiptVenda(venda)}>Comprovante</Button>
                      {venda.status !== 'cancelada' && (
                        <Button variant="ghost" className="!px-2 !py-1 text-xs text-red-400" onClick={() => setCancelTarget(venda.id)}>Cancelar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4"><Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} /></div>
      </Card>

      {viewVenda && (
        <Modal open={!!viewVenda} onClose={() => setViewVenda(null)} title={`Venda #${String(viewVenda.id).padStart(4, '0')}`} size="md">
          <div className="space-y-3 text-sm">
            <p className="text-gray-400">Cliente: <span className="text-gray-200">{viewVenda.cliente}</span></p>
            <p className="text-gray-400">Data: <span className="text-gray-200">{formatDate(viewVenda.data)}</span></p>
            <p className="text-gray-400">Vendedor: <span className="text-gray-200">{viewVenda.vendedor}</span></p>
            <p className="text-gray-400">Status: <BadgeStatus label={statusLabel[viewVenda.status]} variant={statusVariant[viewVenda.status]} /></p>
            <div className="border-t border-dark-600 pt-3">
              <p className="text-gray-500 font-medium mb-2">Itens</p>
              {viewVenda.itens.map((item, i) => (
                <div key={i} className="flex justify-between text-gray-300 py-1">
                  <span>{item.produto} x{item.quantidade}</span>
                  <span>{formatCurrency(item.quantidade * item.precoUnitario)}</span>
                </div>
              ))}
            </div>
            {viewVenda.desconto > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Desconto</span>
                <span className="text-red-400">-{formatCurrency(viewVenda.desconto)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-accent border-t border-dark-600 pt-3">
              <span>Total</span>
              <span>{formatCurrency(viewVenda.total)}</span>
            </div>
            <p className="text-gray-400">Pagamento: <span className="text-gray-200">{formaPagamentoLabel[viewVenda.formaPagamento]}{viewVenda.parcelas > 1 ? ` (${viewVenda.parcelas}x)` : ''}</span></p>
          </div>
        </Modal>
      )}

      {receiptVenda && <ReceiptModal venda={receiptVenda} onClose={() => setReceiptVenda(null)} />}

      <ConfirmDialog open={cancelTarget !== null} onClose={() => setCancelTarget(null)} onConfirm={() => { if (cancelTarget) handleCancel(cancelTarget) }} title="Cancelar Venda" message="Tem certeza que deseja cancelar esta venda?" />
    </div>
  )
}
