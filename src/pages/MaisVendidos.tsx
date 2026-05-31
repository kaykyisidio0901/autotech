import { useMemo, useState, useEffect } from 'react'
import { fetchProdutos } from '../services/produtos'
import { fetchVendas } from '../services/vendas'
import type { Produto, Venda } from '../types'
import { Card } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import { getProdutoImage } from '../utils/produtoImagem'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Calendar, TrendingUp, Medal, Package } from 'lucide-react'

export function MaisVendidos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('mes')

  useEffect(() => {
    async function load() {
      try {
        const [prods, vnds] = await Promise.all([
          fetchProdutos(),
          fetchVendas(),
        ])
        setProdutos(prods)
        setVendas(vnds)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const ranking = useMemo(() => {
    const vendasNoPeriodo = vendas.filter(v => {
      if (v.status === 'cancelada') return false
      const d = new Date(v.data)
      const now = new Date()
      if (period === 'hoje') return d.toDateString() === now.toDateString()
      if (period === 'semana') {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return d >= weekAgo
      }
      if (period === 'mes') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return d.getFullYear() === now.getFullYear()
    })

    const counts: Record<string, { qtd: number; total: number }> = {}
    vendasNoPeriodo.forEach(v => {
      v.itens.forEach(item => {
        if (!counts[item.produto]) counts[item.produto] = { qtd: 0, total: 0 }
        counts[item.produto].qtd += item.quantidade
        counts[item.produto].total += item.quantidade * item.precoUnitario
      })
    })

    return Object.entries(counts)
      .map(([produtoNome, data]) => {
        const prod = produtos.find(p => p.nome === produtoNome)
        return { ...data, produtoId: prod?.id ?? 0, produto }
      })
      .filter(x => x.produto)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 10)
  }, [vendas, produtos, period])

  const totalVendido = useMemo(() => ranking.reduce((s, r) => s + r.total, 0), [ranking])
  const totalUnidades = useMemo(() => ranking.reduce((s, r) => s + r.qtd, 0), [ranking])

  const periods = [
    { key: 'hoje' as const, label: 'Hoje' },
    { key: 'semana' as const, label: 'Esta Semana' },
    { key: 'mes' as const, label: 'Este Mês' },
    { key: 'ano' as const, label: 'Este Ano' },
  ]

  const cores = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7', '#a7f3d0', '#065f46', '#047857', '#059669', '#10b981']

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Mais Vendidos</h1>
        <p className="text-sm text-gray-500 mt-1">Ranking de produtos mais vendidos no período</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {periods.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p.key ? 'bg-accent text-white' : 'bg-dark-800 text-gray-400 border border-dark-600 hover:border-accent/40'
            } cursor-pointer`}>
            <Calendar size={14} className="inline mr-1.5" />{p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"><TrendingUp size={20} className="text-accent" /></div><div><p className="text-xs text-gray-500">Total Vendido</p><p className="text-lg font-bold text-gray-100">{formatCurrency(totalVendido)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Package size={20} className="text-blue-400" /></div><div><p className="text-xs text-gray-500">Unidades</p><p className="text-lg font-bold text-gray-100">{totalUnidades}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center"><Medal size={20} className="text-yellow-400" /></div><div><p className="text-xs text-gray-500">Top 1</p><p className="text-lg font-bold text-gray-100 truncate max-w-[180px]">{ranking[0]?.produto?.nome || '—'}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Medal size={20} className="text-purple-400" /></div><div><p className="text-xs text-gray-500">Top 2</p><p className="text-lg font-bold text-gray-100 truncate max-w-[180px]">{ranking[1]?.produto?.nome || '—'}</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Gráfico — Quantidade Vendida</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ranking} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="produto.nome" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="qtd" name="Unidades" radius={[4, 4, 0, 0]}>
                {ranking.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Ranking</h3>
          <div className="space-y-3">
            {ranking.map((item, i) => (
              <div key={item.produtoId || i} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-700 text-gray-500'}`}>
                  {i + 1}
                </div>
                <img src={getProdutoImage(item.produtoId)} alt={item.produto!.nome} className="w-10 h-10 rounded-lg object-cover bg-dark-900" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{item.produto!.nome}</p>
                  <p className="text-xs text-gray-500">{item.qtd} un vendidas</p>
                </div>
                <span className="text-sm text-accent font-semibold">{formatCurrency(item.total)}</span>
              </div>
            ))}
            {ranking.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Nenhuma venda no período.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
