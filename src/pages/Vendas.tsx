import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { mockVendas } from '../mock/vendas'
import { mockProdutos } from '../mock/produtos'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type { FormaPagamento, VendaStatus, Venda, Produto } from '../types'
import { ReceiptModal } from '../components/receipt/ReceiptModal'

const formaPagamentoLabel: Record<FormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'Pix',
  boleto: 'Boleto',
}

const statusStyle: Record<VendaStatus, string> = {
  concluida: 'bg-green-500/20 text-green-400',
  cancelada: 'bg-red-500/20 text-red-400',
  pendente: 'bg-yellow-500/20 text-yellow-400',
}
const statusLabel: Record<VendaStatus, string> = {
  concluida: 'Concluída',
  cancelada: 'Cancelada',
  pendente: 'Pendente',
}

interface VendaFormItem {
  produto: string
  quantidade: number
  precoUnitario: number
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

let nextProdId = mockProdutos.length + 1

export function Vendas() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [vendas, setVendas] = useState(mockVendas)
  const [produtos, setProdutos] = useState(mockProdutos)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VendaStatus | 'todas'>('todas')
  const [showModal, setShowModal] = useState(false)
  const [receiptVenda, setReceiptVenda] = useState<Venda | null>(null)

  const [cliente, setCliente] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro')
  const [parcelas, setParcelas] = useState(1)
  const [desconto, setDesconto] = useState(0)
  const [itens, setItens] = useState<VendaFormItem[]>([
    { produto: '', quantidade: 1, precoUnitario: 0 },
  ])

  const [novoProdutoNome, setNovoProdutoNome] = useState('')
  const [novoProdutoPreco, setNovoProdutoPreco] = useState(0)
  const [criandoProduto, setCriandoProduto] = useState<number | null>(null)

  const canDiscount = user?.role === 'proprietario' || user?.role === 'gerente'

  const filtered = useMemo(() => {
    return vendas.filter((v) => {
      const matchSearch =
        v.cliente.toLowerCase().includes(search.toLowerCase()) ||
        v.id.toString().includes(search)
      const matchStatus = statusFilter === 'todas' || v.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [vendas, search, statusFilter])

  const subtotal = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0)
  }, [itens])

  const totalComDesconto = useMemo(() => {
    return Math.max(0, subtotal - desconto)
  }, [subtotal, desconto])

  function handleProdutoChange(index: number, selected: string) {
    if (selected === '__novo__') {
      setCriandoProduto(index)
      setNovoProdutoNome('')
      setNovoProdutoPreco(0)
      return
    }
    setCriandoProduto(null)
    const produto = produtos.find((p) => p.nome === selected)
    setItens((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], produto: selected, precoUnitario: produto?.precoVenda ?? 0 }
      return next
    })
  }

  function confirmarNovoProduto(index: number) {
    if (!novoProdutoNome.trim() || novoProdutoPreco <= 0) return
    const novo: Produto = {
      id: nextProdId++, codigoInterno: '', codigoBarras: '', nome: novoProdutoNome.trim(),
      categoria: '', marca: '', fornecedor: '', descricao: '',
      precoCusto: 0, precoVenda: novoProdutoPreco, quantidade: 0, estoqueMinimo: 0, status: true,
    }
    setProdutos((prev) => [...prev, novo])
    setItens((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], produto: novo.nome, precoUnitario: novo.precoVenda }
      return next
    })
    setCriandoProduto(null)
  }

  function handlePriceChange(index: number, value: number) {
    setItens((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], precoUnitario: value }
      return next
    })
  }

  function addItem() {
    setItens((prev) => [...prev, { produto: '', quantidade: 1, precoUnitario: 0 }])
  }

  function removeItem(index: number) {
    if (criandoProduto === index) setCriandoProduto(null)
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const itensValidos = itens.filter((i) => i.produto && i.quantidade > 0)
    if (!cliente || itensValidos.length === 0) return

    const nova: Venda = {
      id: Math.max(...vendas.map((v) => v.id), 0) + 1,
      cliente,
      itens: itensValidos,
      total: totalComDesconto,
      desconto,
      formaPagamento,
      parcelas: formaPagamento === 'cartao_credito' ? parcelas : 1,
      status: 'concluida',
      vendedor: user?.nome ?? 'Sistema',
      data: new Date().toISOString().split('T')[0],
    }

    setVendas((prev) => [nova, ...prev])
    resetForm()
    setReceiptVenda(nova)
  }

  function resetForm() {
    setShowModal(false)
    setCliente('')
    setFormaPagamento('dinheiro')
    setParcelas(1)
    setDesconto(0)
    setItens([{ produto: '', quantidade: 1, precoUnitario: 0 }])
    setCriandoProduto(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Vendas</h1>
          <p className="text-sm text-gray-500 mt-1">Registro de vendas realizadas</p>
        </div>
        <Button onClick={() => navigate('/pdv')}>+ Nova Venda</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por cliente ou ID..."
            className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VendaStatus | 'todas')}
        >
          <option value="todas">Todos os status</option>
          <option value="concluida">Concluída</option>
          <option value="pendente">Pendente</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-gray-500 font-medium px-4 py-3">ID</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Cliente</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Data</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Valor</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Desc.</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Pagamento</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Vendedor</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-right text-gray-500 font-medium px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((venda) => (
                <tr key={venda.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">#{String(venda.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{venda.cliente}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(venda.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-gray-200 font-medium">{formatCurrency(venda.total)}</td>
                  <td className="px-4 py-3 text-gray-400">{venda.desconto > 0 ? `-${formatCurrency(venda.desconto)}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {formaPagamentoLabel[venda.formaPagamento]}
                    {venda.parcelas > 1 && ` (${venda.parcelas}x)`}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{venda.vendedor}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[venda.status]}`}>
                      {statusLabel[venda.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setReceiptVenda(venda)}
                      className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer font-medium"
                    >
                      Comprovante
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Nova Venda</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Cliente"
                placeholder="Nome do cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
              />

              <div>
                <label className="text-sm font-medium text-gray-400 block mb-2">Itens</label>
                <div className="space-y-2">
                  {itens.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-2">
                        {criandoProduto === index ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Nome do produto"
                              className="flex-1 px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                              value={novoProdutoNome}
                              onChange={(e) => setNovoProdutoNome(e.target.value)}
                              autoFocus
                            />
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder="Preço"
                              className="w-24 px-2 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                              value={novoProdutoPreco || ''}
                              onChange={(e) => setNovoProdutoPreco(Number(e.target.value))}
                            />
                            <button
                              type="button"
                              onClick={() => confirmarNovoProduto(index)}
                              disabled={!novoProdutoNome.trim() || novoProdutoPreco <= 0}
                              className="px-3 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-50 cursor-pointer"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => setCriandoProduto(null)}
                              className="text-gray-500 hover:text-gray-300 text-sm cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <>
                            <select
                              className="flex-1 px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                              value={item.produto}
                              onChange={(e) => handleProdutoChange(index, e.target.value)}
                            >
                              <option value="">Selecione...</option>
                              {produtos.map((p) => (
                                <option key={p.id} value={p.nome}>{p.nome} — {formatCurrency(p.precoVenda)}</option>
                              ))}
                              <option value="__novo__">+ Cadastrar Novo Produto</option>
                            </select>
                            <input
                              type="number"
                              min={1}
                              className="w-16 px-2 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all text-center"
                              value={item.quantidade}
                              onChange={(e) => {
                                setItens((prev) => {
                                  const next = [...prev]
                                  next[index] = { ...next[index], quantidade: Number(e.target.value) }
                                  return next
                                })
                              }}
                            />
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              className="w-22 px-2 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all text-right"
                              value={item.precoUnitario}
                              onChange={(e) => handlePriceChange(index, Number(e.target.value))}
                            />
                            <span className="text-sm text-gray-400 w-20 text-right font-medium">
                              {formatCurrency(item.quantidade * item.precoUnitario)}
                            </span>
                            {itens.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {criandoProduto === null && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-2 text-sm text-accent hover:text-accent-hover transition-colors cursor-pointer"
                  >
                    + Adicionar item
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Forma de Pagamento</label>
                  <select
                    className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">Pix</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>
                {formaPagamento === 'cartao_credito' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Parcelas</label>
                    <select
                      className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                      value={parcelas}
                      onChange={(e) => setParcelas(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>{n}x</option>
                      ))}
                    </select>
                  </div>
                )}
                {canDiscount && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Desconto (R$)</label>
                    <input
                      type="number"
                      min={0}
                      max={subtotal}
                      step={0.01}
                      placeholder="0,00"
                      className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                      value={desconto || ''}
                      onChange={(e) => setDesconto(Math.min(Number(e.target.value), subtotal))}
                    />
                  </div>
                )}
                {!canDiscount && (
                  <div className="flex flex-col gap-1.5 opacity-40">
                    <label className="text-sm font-medium text-gray-400">Desconto</label>
                    <div className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-500 text-sm">
                      Apenas Gerente/Proprietário
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right space-y-1">
                {desconto > 0 && (
                  <p className="text-sm text-gray-500">
                    Subtotal: {formatCurrency(subtotal)}
                  </p>
                )}
                <p className="text-lg font-semibold text-gray-100">
                  Total: {formatCurrency(totalComDesconto)}
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!cliente || itens.every((i) => !i.produto)}>
                  Confirmar Venda
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {receiptVenda && (
        <ReceiptModal
          venda={receiptVenda}
          onClose={() => setReceiptVenda(null)}
        />
      )}
    </div>
  )
}
