import { useState, useMemo } from 'react'
import { mockProdutos } from '../mock/produtos'
import { Card } from '../components/ui/Card'
import { Pagination } from '../components/ui/Pagination'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { formatCurrency, situacaoEstoque } from '../utils/format'
import { getIndicadores } from '../services/estoque'

export function Estoque() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [situacaoFilter, setSituacaoFilter] = useState<string>('todas')
  const pageSize = 10

  const indicadores = useMemo(() => getIndicadores(), [])

  const filtered = useMemo(() => {
    let list = mockProdutos.filter((p) => {
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.categoria.toLowerCase().includes(search.toLowerCase())
      if (situacaoFilter === 'todas') return matchSearch
      const sit = situacaoEstoque(p.quantidade, p.estoqueMinimo)
      return matchSearch && sit.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === situacaoFilter
    })
    return list
  }, [search, situacaoFilter])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Estoque</h1>
        <p className="text-sm text-gray-500 mt-1">Painel de controle de estoque</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Produtos Cadastrados</p>
          <p className="text-2xl font-semibold text-gray-100 mt-1">{indicadores.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Sem Estoque</p>
          <p className="text-2xl font-semibold text-red-400 mt-1">{indicadores.semEstoque}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Estoque Baixo</p>
          <p className="text-2xl font-semibold text-yellow-400 mt-1">{indicadores.estoqueBaixo}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Valor Total em Estoque</p>
          <p className="text-2xl font-semibold text-accent mt-1">{formatCurrency(indicadores.valorTotal)}</p>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por produto ou categoria..."
            className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
          value={situacaoFilter}
          onChange={(e) => { setSituacaoFilter(e.target.value); setPage(1) }}
        >
          <option value="todas">Todas as situações</option>
          <option value="normal">Normal</option>
          <option value="baixo">Baixo</option>
          <option value="critico">Crítico</option>
          <option value="sem estoque">Sem Estoque</option>
        </select>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Produto</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Categoria</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Quantidade</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Estoque Mínimo</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Situação</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((prod) => {
                const situacao = situacaoEstoque(prod.quantidade, prod.estoqueMinimo)
                return (
                  <tr key={prod.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                    <td className="px-4 py-3 text-gray-200 font-medium">{prod.nome}</td>
                    <td className="px-4 py-3 text-gray-400">{prod.categoria}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${situacao.variant === 'danger' ? 'text-red-400' : situacao.variant === 'warning' ? 'text-yellow-400' : 'text-gray-200'}`}>
                        {prod.quantidade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{prod.estoqueMinimo}</td>
                    <td className="px-4 py-3"><BadgeStatus label={situacao.label} variant={situacao.variant} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
        </div>
      </Card>
    </div>
  )
}
