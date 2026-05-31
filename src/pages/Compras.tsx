import { useState, useEffect } from 'react'
import { listarCompras, listarNotasFiscais } from '../services/notasFiscais'
import type { Compra, NotaFiscal } from '../types'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import { Search, Eye, FileText, Printer } from 'lucide-react'

export function Compras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [detailNota, setDetailNota] = useState<NotaFiscal | null>(null)
  const pageSize = 5

  useEffect(() => {
    async function load() {
      try {
        const [comprasData, notasData] = await Promise.all([
          listarCompras(),
          listarNotasFiscais(),
        ])
        setCompras(comprasData)
        setNotasFiscais(notasData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = compras.filter(c =>
    c.numeroNfe.toLowerCase().includes(search.toLowerCase()) ||
    c.fornecedor.toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function getNota(numeroNfe: string) {
    return notasFiscais.find(n => n.numero === numeroNfe) || null
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Compras</h1>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent"
            placeholder="Buscar por NF-e ou fornecedor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-dark-600">
                <th className="text-left py-3 px-2">NF-e</th>
                <th className="text-left py-3 px-2">Fornecedor</th>
                <th className="text-left py-3 px-2">Data</th>
                <th className="text-right py-3 px-2">Valor</th>
                <th className="text-right py-3 px-2">Produtos</th>
                <th className="text-center py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="py-3 px-2 font-medium text-accent">{c.numeroNfe}</td>
                  <td className="py-3 px-2 text-gray-200">{c.fornecedor}</td>
                  <td className="py-3 px-2 text-gray-400">{formatDate(c.data)}</td>
                  <td className="py-3 px-2 text-right text-gray-200">{formatCurrency(c.valor)}</td>
                  <td className="py-3 px-2 text-right text-gray-400">{c.quantidadeProdutos}</td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setDetailNota(getNota(c.numeroNfe))} className="text-gray-500 hover:text-blue-400 transition-colors cursor-pointer" title="Visualizar">
                        <Eye size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-accent transition-colors cursor-pointer" title="Reprocessar XML">
                        <FileText size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer" title="Imprimir">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Nenhuma compra encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
      </Card>

      <Modal open={detailNota !== null} onClose={() => setDetailNota(null)} title={`NF-e ${detailNota?.numero || ''}`} size="xl">
        {detailNota && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Fornecedor:</span> <span className="text-gray-200 ml-2">{detailNota.fornecedor}</span></div>
              <div><span className="text-gray-500">CNPJ:</span> <span className="text-gray-200 ml-2">{detailNota.cnpj}</span></div>
              <div><span className="text-gray-500">Emissão:</span> <span className="text-gray-200 ml-2">{formatDate(detailNota.dataEmissao)}</span></div>
              <div><span className="text-gray-500">Valor:</span> <span className="text-accent ml-2 font-semibold">{formatCurrency(detailNota.valorTotal)}</span></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Produtos</h4>
              {detailNota.produtos.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg mb-2 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 w-16">{p.codigo}</span>
                    <span className="text-gray-200">{p.nome}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-400">{p.quantidade}x</span>
                    <span className="text-gray-400">{formatCurrency(p.valorUnitario)}</span>
                    <span className="text-gray-200 w-24 text-right">{formatCurrency(p.valorTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
