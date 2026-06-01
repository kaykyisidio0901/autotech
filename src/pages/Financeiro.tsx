import { useState, useEffect, useMemo } from 'react'
import { listarContasReceber, listarContasPagar, atualizarContaReceber, atualizarContaPagar } from '../services/financeiro'
import type { ContaReceber, ContaPagar, ContaStatus } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import { useAuthStore } from '../stores/authStore'
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, DollarSign, Receipt } from 'lucide-react'

type Tab = 'receber' | 'pagar' | 'fluxo'

const statusVariant: Record<ContaStatus, 'success' | 'danger' | 'warning'> = {
  pendente: 'warning',
  pago: 'success',
  vencido: 'danger',
}

const statusLabel: Record<ContaStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  vencido: 'Vencido',
}

export function Financeiro() {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'admin' || user?.role === 'proprietario' || user?.role === 'gerente'
  const [tab, setTab] = useState<Tab>('fluxo')
  const [receber, setReceber] = useState<ContaReceber[]>([])
  const [pagar, setPagar] = useState<ContaPagar[]>([])
  const [filterStatus, setFilterStatus] = useState<ContaStatus | 'todas'>('todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [contasReceber, contasPagar] = await Promise.all([
          listarContasReceber(),
          listarContasPagar(),
        ])
        setReceber(contasReceber)
        setPagar(contasPagar)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fluxo = useMemo(() => {
    const totalRecebido = receber.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0)
    const totalAReceber = receber.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((s, c) => s + c.valor, 0)
    const totalPago = pagar.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0)
    const totalAPagar = pagar.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((s, c) => s + c.valor, 0)
    return { totalRecebido, totalAReceber, totalPago, totalAPagar, lucroEstimado: totalRecebido + totalAReceber - totalPago - totalAPagar }
  }, [receber, pagar])

  const filteredReceber = useMemo(() => {
    if (filterStatus === 'todas') return receber
    return receber.filter(c => c.status === filterStatus)
  }, [receber, filterStatus])

  const filteredPagar = useMemo(() => {
    if (filterStatus === 'todas') return pagar
    return pagar.filter(c => c.status === filterStatus)
  }, [pagar, filterStatus])

  async function baixarReceber(conta: ContaReceber) {
    const updated = await atualizarContaReceber(conta.id, { status: 'pago' })
    if (updated) setReceber(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function baixarPagar(conta: ContaPagar) {
    const updated = await atualizarContaPagar(conta.id, { status: 'pago' })
    if (updated) setPagar(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Financeiro</h1>
        <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
          {(['fluxo', 'receber', 'pagar'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${tab === t ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {t === 'fluxo' ? 'Fluxo de Caixa' : t === 'receber' ? 'Contas a Receber' : 'Contas a Pagar'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'fluxo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card><div className="text-center"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20 text-green-400 mx-auto mb-3"><DollarSign size={20} /></div><p className="text-xs text-gray-500 mb-1">Total Recebido</p><p className="text-lg font-bold text-green-400">{formatCurrency(fluxo.totalRecebido)}</p></div></Card>
            <Card><div className="text-center"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 mx-auto mb-3"><ArrowDownCircle size={20} /></div><p className="text-xs text-gray-500 mb-1">A Receber</p><p className="text-lg font-bold text-yellow-400">{formatCurrency(fluxo.totalAReceber)}</p></div></Card>
            <Card><div className="text-center"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20 text-red-400 mx-auto mb-3"><ArrowUpCircle size={20} /></div><p className="text-xs text-gray-500 mb-1">Total Pago</p><p className="text-lg font-bold text-red-400">{formatCurrency(fluxo.totalPago)}</p></div></Card>
            <Card><div className="text-center"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 mx-auto mb-3"><Receipt size={20} /></div><p className="text-xs text-gray-500 mb-1">A Pagar</p><p className="text-lg font-bold text-blue-400">{formatCurrency(fluxo.totalAPagar)}</p></div></Card>
            <Card><div className="text-center"><div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20 text-accent mx-auto mb-3"><TrendingUp size={20} /></div><p className="text-xs text-gray-500 mb-1">Lucro Estimado</p><p className="text-lg font-bold text-accent">{formatCurrency(fluxo.lucroEstimado)}</p></div></Card>
          </div>
          <Card>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resumo Financeiro</h3>
            <div className="space-y-4">
              {[
                { label: 'Entradas (Recebido)', value: fluxo.totalRecebido, color: 'bg-green-500', pct: fluxo.totalRecebido + fluxo.totalAReceber > 0 ? (fluxo.totalRecebido / (fluxo.totalRecebido + fluxo.totalAReceber)) * 100 : 0 },
                { label: 'Entradas (Pendente)', value: fluxo.totalAReceber, color: 'bg-yellow-500', pct: fluxo.totalRecebido + fluxo.totalAReceber > 0 ? (fluxo.totalAReceber / (fluxo.totalRecebido + fluxo.totalAReceber)) * 100 : 0 },
                { label: 'Saídas (Pago)', value: fluxo.totalPago, color: 'bg-red-500', pct: fluxo.totalPago + fluxo.totalAPagar > 0 ? (fluxo.totalPago / (fluxo.totalPago + fluxo.totalAPagar)) * 100 : 0 },
                { label: 'Saídas (Pendente)', value: fluxo.totalAPagar, color: 'bg-blue-500', pct: fluxo.totalPago + fluxo.totalAPagar > 0 ? (fluxo.totalAPagar / (fluxo.totalPago + fluxo.totalAPagar)) * 100 : 0 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-gray-200">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {(tab === 'receber' || tab === 'pagar') && (
        <>
          <div className="flex items-center gap-3">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ContaStatus | 'todas')}
              className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
              <option value="todas">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-dark-600">
                    <th className="text-left py-3 px-2">{tab === 'receber' ? 'Cliente' : 'Fornecedor'}</th>
                    <th className="text-left py-3 px-2">Descrição</th>
                    <th className="text-right py-3 px-2">Valor</th>
                    <th className="text-left py-3 px-2">Vencimento</th>
                    <th className="text-center py-3 px-2">Status</th>
                    <th className="text-center py-3 px-2">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'receber' ? filteredReceber : filteredPagar).map(c => (
                    <tr key={c.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                      <td className="py-3 px-2 font-medium text-gray-200">{tab === 'receber' ? (c as ContaReceber).cliente : (c as ContaPagar).fornecedor}</td>
                      <td className="py-3 px-2 text-gray-400">{c.descricao}</td>
                      <td className="py-3 px-2 text-right text-gray-200">{formatCurrency(c.valor)}</td>
                      <td className="py-3 px-2 text-gray-400">{formatDate(c.vencimento)}</td>
                      <td className="py-3 px-2 text-center">
                        <BadgeStatus label={statusLabel[c.status]} variant={statusVariant[c.status]} />
                      </td>
                      <td className="py-3 px-2 text-center">
                        {c.status !== 'pago' && canEdit && (
                          <Button variant="ghost" onClick={() => tab === 'receber' ? baixarReceber(c as ContaReceber) : baixarPagar(c as ContaPagar)}>
                            {c.status === 'vencido' ? 'Regularizar' : 'Baixar'}
                          </Button>
                        )}
                        {c.status === 'pago' && <span className="text-gray-600 text-xs">—</span>}
                      </td>
                    </tr>
                  ))}
                  {(tab === 'receber' ? filteredReceber : filteredPagar).length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-500">Nenhum registro encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
