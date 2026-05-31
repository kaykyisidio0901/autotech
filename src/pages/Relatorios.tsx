import { useState, useMemo } from 'react'
import { mockVendas } from '../mock/vendas'
import { mockOrdensServico } from '../mock/ordensServico'
import { mockContasPagar } from '../mock/financeiro'
import { Card } from '../components/ui/Card'
import { formatCurrency, formatDate } from '../utils/format'
import { BarChart, TrendingUp, DollarSign, Wrench } from 'lucide-react'

type Periodo = 'diario' | 'semanal' | 'mensal' | 'anual'

export function Relatorios() {
  const [periodo, setPeriodo] = useState<Periodo>('diario')

  const relatorio = useMemo(() => {
    const hoje = new Date()
    const hojeStr = hoje.toISOString().slice(0, 10)
    const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    const fimSemana = new Date(inicioSemana); fimSemana.setDate(inicioSemana.getDate() + 6)
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const inicioAno = new Date(hoje.getFullYear(), 0, 1)

    const vendasPeriodo = mockVendas.filter(v => {
      if (v.status === 'cancelada') return false
      const d = new Date(v.data)
      if (periodo === 'diario') return v.data === hojeStr
      if (periodo === 'semanal') return d >= inicioSemana && d <= fimSemana
      if (periodo === 'mensal') return d >= inicioMes
      return d >= inicioAno
    })

    const servicosPeriodo = mockOrdensServico.filter(os => {
      const d = new Date(os.dataEntrada)
      if (periodo === 'diario') return os.dataEntrada === hojeStr
      if (periodo === 'semanal') return d >= inicioSemana && d <= fimSemana
      if (periodo === 'mensal') return d >= inicioMes
      return d >= inicioAno
    })

    const faturamento = vendasPeriodo.reduce((s, v) => s + v.total - v.desconto, 0)
    const servicosReceita = servicosPeriodo.filter(s => s.status === 'finalizada' || s.status === 'entregue').reduce((s, os) => s + os.valorFinal, 0)
    const receitaTotal = faturamento + servicosReceita

    const produtosVendidos: Record<string, { qtd: number; total: number }> = {}
    vendasPeriodo.forEach(v => v.itens.forEach(item => {
      if (!produtosVendidos[item.produto]) produtosVendidos[item.produto] = { qtd: 0, total: 0 }
      produtosVendidos[item.produto].qtd += item.quantidade
      produtosVendidos[item.produto].total += item.precoUnitario * item.quantidade
    }))
    const maisVendidos = Object.entries(produtosVendidos).sort((a, b) => b[1].qtd - a[1].qtd).slice(0, 5)

    const contasPagas = mockContasPagar.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0)
    const contasPendentes = mockContasPagar.filter(c => c.status !== 'pago').reduce((s, c) => s + c.valor, 0)
    const despesas = contasPagas

    const dias = periodo === 'diario' ? 1 : periodo === 'semanal' ? 7 : periodo === 'mensal' ? 30 : 365
    const crescimento = receitaTotal > 0 ? (receitaTotal / dias) * 30 : 0

    const vendasPorDia = mockVendas
      .filter(v => new Date(v.data) >= inicioMes && v.status !== 'cancelada')
      .reduce<Record<string, number>>((acc, v) => {
        acc[v.data] = (acc[v.data] || 0) + v.total - v.desconto
        return acc
      }, {})

    return {
      vendas: vendasPeriodo, servicos: servicosPeriodo, faturamento, servicosReceita, receitaTotal,
      maisVendidos, contasPagas, contasPendentes, despesas, lucro: receitaTotal - despesas, crescimento,
      vendasPorDia: Object.entries(vendasPorDia).sort((a, b) => a[0].localeCompare(b[0])),
    }
  }, [periodo])

  const periodos = [
    { value: 'diario' as Periodo, label: 'Diário' },
    { value: 'semanal' as Periodo, label: 'Semanal' },
    { value: 'mensal' as Periodo, label: 'Mensal' },
    { value: 'anual' as Periodo, label: 'Anual' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Relatórios</h1>
        <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
          {periodos.map(p => (
            <button key={p.value} onClick={() => setPeriodo(p.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${periodo === p.value ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><div className="text-center"><DollarSign size={20} className="text-accent mx-auto mb-2" /><p className="text-xs text-gray-500 mb-1">Faturamento</p><p className="text-lg font-bold text-accent">{formatCurrency(relatorio.faturamento)}</p></div></Card>
        <Card><div className="text-center"><Wrench size={20} className="text-blue-400 mx-auto mb-2" /><p className="text-xs text-gray-500 mb-1">Serviços</p><p className="text-lg font-bold text-blue-400">{formatCurrency(relatorio.servicosReceita)}</p></div></Card>
        <Card><div className="text-center"><TrendingUp size={20} className="text-green-400 mx-auto mb-2" /><p className="text-xs text-gray-500 mb-1">Receita Total</p><p className="text-lg font-bold text-green-400">{formatCurrency(relatorio.receitaTotal)}</p></div></Card>
        <Card><div className="text-center"><BarChart size={20} className="text-yellow-400 mx-auto mb-2" /><p className="text-xs text-gray-500 mb-1">Lucro</p><p className="text-lg font-bold text-yellow-400">{formatCurrency(relatorio.lucro)}</p></div></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Vendas neste período</h3>
          {relatorio.vendas.length > 0 ? (
            <div className="space-y-2">
              {relatorio.vendas.slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg">
                  <div>
                    <span className="text-gray-300 text-sm">{v.cliente}</span>
                    <span className="text-gray-500 text-xs ml-2">{formatDate(v.data)}</span>
                  </div>
                  <span className="text-accent text-sm font-medium">{formatCurrency(v.total - v.desconto)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">Nenhuma venda no período</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Serviços realizados</h3>
          {relatorio.servicos.length > 0 ? (
            <div className="space-y-2">
              {relatorio.servicos.slice(0, 5).map(os => (
                <div key={os.id} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg">
                  <div>
                    <span className="text-gray-300 text-sm">{os.clienteNome} — {os.veiculoPlaca}</span>
                    <span className="text-gray-500 text-xs ml-2">{formatDate(os.dataEntrada)}</span>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">{formatCurrency(os.valorFinal)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm">Nenhum serviço no período</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {periodo === 'diario' ? 'Vendas do Dia' : periodo === 'semanal' ? 'Vendas da Semana' : 'Vendas do Mês'}
          </h3>
          {relatorio.vendasPorDia.length > 0 ? (
            <div className="space-y-3">
              {relatorio.vendasPorDia.slice(-10).map(([data, valor]) => {
                const maxVal = Math.max(...relatorio.vendasPorDia.map(([_, v]) => v), 1)
                return (
                  <div key={data}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{formatDate(data)}</span>
                      <span className="text-gray-300">{formatCurrency(valor)}</span>
                    </div>
                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(valor / maxVal) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-gray-500 text-sm">Nenhum dado disponível</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Produtos Mais Vendidos</h3>
          {relatorio.maisVendidos.length > 0 ? (
            <div className="space-y-3">
              {relatorio.maisVendidos.map(([nome, data]) => {
                const maxQtd = Math.max(...relatorio.maisVendidos.map(([_, d]) => d.qtd), 1)
                return (
                  <div key={nome}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 truncate max-w-[200px]">{nome}</span>
                      <span className="text-gray-300">{data.qtd} un</span>
                    </div>
                    <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(data.qtd / maxQtd) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-gray-500 text-sm">Nenhum produto vendido no período</p>}
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resumo Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Receita</p>
            <p className="text-green-400 font-semibold">{formatCurrency(relatorio.receitaTotal)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Despesas</p>
            <p className="text-red-400 font-semibold">{formatCurrency(relatorio.despesas)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Lucro</p>
            <p className="text-yellow-400 font-semibold">{formatCurrency(relatorio.lucro)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Crescimento (mês)</p>
            <p className="text-blue-400 font-semibold">{formatCurrency(relatorio.crescimento)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Contas Pagas</p>
            <p className="text-green-400 font-semibold">{formatCurrency(relatorio.contasPagas)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Contas Pendentes</p>
            <p className="text-yellow-400 font-semibold">{formatCurrency(relatorio.contasPendentes)}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Vendas</p>
            <p className="text-accent font-semibold">{relatorio.vendas.length}</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Serviços</p>
            <p className="text-blue-400 font-semibold">{relatorio.servicos.length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
