import { useState, useMemo, useCallback, useEffect } from 'react'
import { fetchProdutos } from '../services/produtos'
import { listarClientes } from '../services/clientes'
import { createVenda } from '../services/vendas'
import { api } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import { getProdutoImage } from '../utils/produtoImagem'
import { useAuthStore } from '../stores/authStore'
import type { FormaPagamento, Venda, Cliente, Produto, User } from '../types'
import { Printer, Search, X } from 'lucide-react'

interface CartItem {
  produtoId: number
  nome: string
  quantidade: number
  precoUnitario: number
}

interface Pagamento {
  tipo: FormaPagamento
  valor: number
  parcelas: number
}

export function PDV() {
  const user = useAuthStore((s) => s.user)
  const canDiscount = user?.role === 'proprietario' || user?.role === 'gerente'

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [funcionarios, setFuncionarios] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [desconto, setDesconto] = useState(0)
  const [showPagamento, setShowPagamento] = useState(false)
  const [showCupom, setShowCupom] = useState(false)
  const [ultimaVenda, setUltimaVenda] = useState<Venda | null>(null)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([{ tipo: 'pix', valor: 0, parcelas: 1 }])
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [clienteSearch, setClienteSearch] = useState('')
  const [showClienteSearch, setShowClienteSearch] = useState(false)
  const [vendedorId, setVendedorId] = useState(user?.id ?? 0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [p, c, u] = await Promise.all([
        fetchProdutos(),
        listarClientes(),
        api.get<User[]>('/users'),
      ])
      setProdutos(p.filter(p => p.status))
      setClientes(c)
      setFuncionarios(u.filter(u => u.ativo))
      setLoading(false)
    }
    load()
  }, [])

  const produtosFiltrados = useMemo(() => {
    return produtos.filter(
      (p) => p.nome.toLowerCase().includes(search.toLowerCase()) || p.categoria.toLowerCase().includes(search.toLowerCase()) || p.marca.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, produtos])

  const clientesFiltrados = useMemo(() => {
    if (!clienteSearch) return clientes
    return clientes.filter(c => c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) || c.cpf.includes(clienteSearch))
  }, [clienteSearch, clientes])

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0), [cart])
  const total = Math.max(0, subtotal - desconto)

  function addToCart(produtoId: number) {
    const prod = produtos.find((p) => p.id === produtoId)
    if (!prod) return
    setCart((prev) => {
      const exist = prev.find((i) => i.produtoId === produtoId)
      if (exist) return prev.map((i) => i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { produtoId: prod.id, nome: prod.nome, quantidade: 1, precoUnitario: prod.precoVenda }]
    })
  }

  function removeFromCart(produtoId: number) {
    setCart((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }

  function updateQtd(produtoId: number, quantidade: number) {
    if (quantidade <= 0) { removeFromCart(produtoId); return }
    setCart((prev) => prev.map((i) => i.produtoId === produtoId ? { ...i, quantidade } : i))
  }

  function updatePrice(produtoId: number, preco: number) {
    setCart((prev) => prev.map((i) => i.produtoId === produtoId ? { ...i, precoUnitario: Math.max(0, preco) } : i))
  }

  function limparCarrinho() {
    setCart([])
    setDesconto(0)
    setCliente(null)
    setPagamentos([{ tipo: 'pix', valor: 0, parcelas: 1 }])
  }

  function totalPago() {
    return pagamentos.reduce((acc, p) => acc + p.valor, 0)
  }

  function troco() {
    return Math.max(0, totalPago() - total)
  }

  function gerarCupom(venda: Venda) {
    setUltimaVenda(venda)
    setShowCupom(true)
  }

  const finalizarVenda = useCallback(async () => {
    const vendedor = funcionarios.find(f => f.id === vendedorId) || user
    const itens = cart.map((i) => ({ produto: i.nome, quantidade: i.quantidade, precoUnitario: i.precoUnitario }))
    setSubmitting(true)
    try {
      const nova = await createVenda({
        cliente: cliente?.nome || 'Consumidor Final',
        itens,
        total,
        desconto,
        formaPagamento: pagamentos.length === 1 ? pagamentos[0].tipo : 'cartao_credito',
        parcelas: pagamentos.length === 1 ? pagamentos[0].parcelas : 1,
        status: 'concluida',
        vendedor: vendedor?.nome ?? 'Sistema',
        data: new Date().toISOString().split('T')[0],
      })
      gerarCupom(nova)
      limparCarrinho()
      setShowPagamento(false)
    } finally {
      setSubmitting(false)
    }
  }, [cart, cliente, total, desconto, pagamentos, funcionarios, vendedorId, user])

  function addPagamento() {
    setPagamentos((prev) => [...prev, { tipo: 'dinheiro', valor: 0, parcelas: 1 }])
  }

  function removePagamento(index: number) {
    setPagamentos((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePagamento(index: number, data: Partial<Pagamento>) {
    setPagamentos((prev) => prev.map((p, i) => i === index ? { ...p, ...data } : p))
  }

  function imprimirCupom() {
    const v = ultimaVenda
    if (!v) return
    const win = window.open('', '_blank', 'width=400,height=600')
    if (!win) return
    win.document.write(`
      <html><head><title>Cupom Não Fiscal</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; color: #000; }
        .header { text-align: center; margin-bottom: 12px; }
        .header h2 { font-size: 16px; margin-bottom: 4px; }
        .header p { font-size: 11px; color: #555; }
        hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
        .item { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
        .item-info { flex: 1; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
        .footer { text-align: center; margin-top: 12px; font-size: 10px; color: #555; }
      </style></head><body>
      <div class="header">
        <h2>AutoTech Manager</h2>
        <p>CNPJ: 00.000.000/0000-00</p>
        <p>Av. Paulista, 1000 - São Paulo - SP</p>
      </div>
      <hr>
      <p><strong>CUPOM NÃO FISCAL</strong></p>
      <p>#${String(v.id).padStart(6, '0')} - ${v.data}</p>
      <p>Cliente: ${v.cliente}</p>
      <p>Vendedor: ${v.vendedor}</p>
      <hr>
      ${v.itens.map(i => `<div class="item"><div class="item-info">${i.produto}<br>${i.quantidade}x ${formatCurrency(i.precoUnitario)}</div><span>${formatCurrency(i.quantidade * i.precoUnitario)}</span></div>`).join('')}
      <hr>
      <div class="total-row"><span>Subtotal</span><span>${formatCurrency(v.total + v.desconto)}</span></div>
      ${v.desconto > 0 ? `<div class="total-row"><span>Desconto</span><span>-${formatCurrency(v.desconto)}</span></div>` : ''}
      <div class="total-row" style="font-size:14px"><span>TOTAL</span><span>${formatCurrency(v.total)}</span></div>
      <hr>
      <p>Obrigado pela preferência!</p>
      <div class="footer">
        <p>Volte sempre</p>
      </div>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">PDV — Ponto de Venda</h1>
        <p className="text-sm text-gray-500 mt-1">Registre vendas de forma rápida</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <input
            type="text"
            placeholder="Buscar produto por nome, categoria ou marca..."
            className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {search && (
            <p className="text-xs text-gray-500">{produtosFiltrados.length} produto(s) encontrado(s)</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {produtosFiltrados.map((prod) => (
              <button
                key={prod.id}
                onClick={() => addToCart(prod.id)}
                className="text-left bg-dark-800 border border-dark-600 rounded-xl p-3 hover:border-accent/50 hover:bg-dark-700 transition-all cursor-pointer group flex gap-3"
              >
                <div className="w-16 h-16 rounded-lg bg-dark-900 overflow-hidden shrink-0">
                  <img src={getProdutoImage(prod.id)} alt={prod.nome} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 group-hover:text-accent transition-colors truncate">{prod.nome}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{prod.marca}</span>
                    <span className="text-sm font-semibold text-accent">{formatCurrency(prod.precoVenda)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <BadgeStatus
                      label={prod.quantidade === 0 ? 'Sem Estoque' : prod.quantidade <= prod.estoqueMinimo ? 'Baixo' : 'Disponível'}
                      variant={prod.quantidade === 0 ? 'danger' : prod.quantidade <= prod.estoqueMinimo ? 'warning' : 'success'}
                    />
                    <span className="text-xs text-gray-600">Qtd: {prod.quantidade}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="flex flex-col h-full">
            <h2 className="text-sm font-semibold text-gray-200 mb-3 flex items-center justify-between">
              <span>Carrinho</span>
              <span className="text-xs text-gray-500">{cart.length} item(ns)</span>
            </h2>

            <div className="flex-1 space-y-2 max-h-[40vh] overflow-y-auto pr-1 mb-4">
              {cart.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">Clique em um produto para adicionar</p>
              )}
              {cart.map((item) => (
                <div key={item.produtoId} className="flex items-center gap-2 bg-dark-900 rounded-lg p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate mb-1">{item.nome}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-20 px-1.5 py-0.5 rounded bg-dark-700 border border-dark-600 text-gray-100 text-xs outline-none focus:border-accent transition-all"
                        value={item.precoUnitario}
                        onChange={(e) => updatePrice(item.produtoId, Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    className="w-12 px-1 py-1 rounded bg-dark-700 border border-dark-600 text-gray-100 text-xs text-center outline-none focus:border-accent transition-all"
                    value={item.quantidade}
                    onChange={(e) => updateQtd(item.produtoId, Number(e.target.value))}
                  />
                  <span className="text-sm text-gray-200 font-medium w-16 text-right">
                    {formatCurrency(item.quantidade * item.precoUnitario)}
                  </span>
                  <button onClick={() => removeFromCart(item.produtoId)} className="text-red-400 hover:text-red-300 cursor-pointer"><X size={14} /></button>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-dark-600">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {canDiscount && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Desconto (R$):</label>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    className="flex-1 px-2 py-1 rounded bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
                    value={desconto || ''}
                    onChange={(e) => setDesconto(Math.min(Number(e.target.value) || 0, subtotal))}
                  />
                </div>
              )}

              <div className="flex justify-between text-lg font-semibold text-gray-100">
                <span>Total</span>
                <span className="text-accent">{formatCurrency(total)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  fullWidth
                  disabled={cart.length === 0}
                  onClick={() => {
                    setPagamentos([{ tipo: 'pix', valor: total, parcelas: 1 }])
                    setShowPagamento(true)
                  }}
                >
                  Finalizar Venda
                </Button>
                <Button variant="secondary" onClick={limparCarrinho} disabled={cart.length === 0}>
                  Limpar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showPagamento} onClose={() => setShowPagamento(false)} title="Finalizar Venda" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Cliente</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Clique para buscar..."
                  readOnly
                  className="flex-1 px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none cursor-pointer focus:border-accent transition-all"
                  value={cliente ? `${cliente.nome} - ${cliente.cpf}` : 'Consumidor Final'}
                  onClick={() => { setClienteSearch(''); setShowClienteSearch(true) }}
                />
                {cliente && (
                  <button onClick={() => setCliente(null)} className="text-red-400 hover:text-red-300 cursor-pointer"><X size={16} /></button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Vendedor</label>
              <select value={vendedorId} onChange={e => setVendedorId(Number(e.target.value))}
                className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all">
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} ({f.role === 'proprietario' ? 'Proprietário' : f.role === 'gerente' ? 'Gerente' : 'Funcionário'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400">Formas de Pagamento</label>
              <button type="button" onClick={addPagamento} className="text-xs text-accent hover:text-accent-hover cursor-pointer">
                + Adicionar pagamento
              </button>
            </div>

            {pagamentos.map((pag, index) => (
              <div key={index} className="flex items-center gap-2 bg-dark-900 rounded-lg p-3">
                <select
                  className="flex-1 px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-gray-100 text-xs outline-none focus:border-accent transition-all"
                  value={pag.tipo}
                  onChange={(e) => updatePagamento(index, { tipo: e.target.value as FormaPagamento })}
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_debito">Cartão Débito</option>
                  <option value="cartao_credito">Cartão Crédito</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Valor"
                  className="w-24 px-2 py-1.5 rounded bg-dark-700 border border-dark-600 text-gray-100 text-xs outline-none focus:border-accent transition-all text-right"
                  value={pag.valor || ''}
                  onChange={(e) => updatePagamento(index, { valor: Number(e.target.value) })}
                />
                {pag.tipo === 'cartao_credito' && (
                  <select
                    className="w-16 px-1 py-1.5 rounded bg-dark-700 border border-dark-600 text-gray-100 text-xs outline-none focus:border-accent transition-all"
                    value={pag.parcelas}
                    onChange={(e) => updatePagamento(index, { parcelas: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                )}
                {pagamentos.length > 1 && (
                  <button onClick={() => removePagamento(index)} className="text-red-400 hover:text-red-300 cursor-pointer"><X size={14} /></button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-sm text-gray-400">
            <span>Total da Venda</span>
            <span className="text-gray-200 font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Total Pago</span>
            <span className={`font-medium ${totalPago() >= total ? 'text-green-400' : 'text-yellow-400'}`}>{formatCurrency(totalPago())}</span>
          </div>
          {troco() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Troco</span>
              <span className="text-accent font-medium">{formatCurrency(troco())}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowPagamento(false)}>Cancelar</Button>
            <Button onClick={finalizarVenda} disabled={totalPago() < total || cart.length === 0 || submitting}>
              {submitting ? 'Salvando...' : 'Confirmar Venda'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showClienteSearch} onClose={() => setShowClienteSearch(false)} title="Selecionar Cliente" size="lg">
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent"
              value={clienteSearch}
              onChange={e => setClienteSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[40vh] overflow-y-auto space-y-1">
            <button
              onClick={() => { setCliente(null); setShowClienteSearch(false) }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-gray-400 hover:bg-dark-700 text-sm transition-all cursor-pointer"
            >
              Consumidor Final
            </button>
            {clientesFiltrados.map(c => (
              <button
                key={c.id}
                onClick={() => { setCliente(c); setShowClienteSearch(false) }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-dark-700 text-sm transition-all cursor-pointer"
              >
                <span className="text-gray-200">{c.nome}</span>
                <span className="text-gray-500 ml-2">{c.cpf}</span>
                <span className="text-gray-600 text-xs ml-2">{c.cidade}/{c.estado}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={showCupom} onClose={() => setShowCupom(false)} title="Venda Realizada" size="sm">
        {ultimaVenda && (
          <div className="space-y-4">
            <div className="bg-dark-900 rounded-xl p-4 text-sm font-mono">
              <div className="text-center mb-3 border-b border-dashed border-dark-600 pb-3">
                <p className="font-bold text-gray-100">AutoTech Manager</p>
                <p className="text-xs text-gray-500">CNPJ: 00.000.000/0000-00</p>
                <p className="text-xs text-gray-500">Av. Paulista, 1000 - São Paulo - SP</p>
              </div>
              <p className="text-center font-semibold text-gray-200 mb-2">CUPOM NÃO FISCAL</p>
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>#{String(ultimaVenda.id).padStart(6, '0')}</span>
                <span>{ultimaVenda.data}</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Cliente: <span className="text-gray-300">{ultimaVenda.cliente}</span></p>
              <p className="text-xs text-gray-500 mb-3">Vendedor: <span className="text-gray-300">{ultimaVenda.vendedor}</span></p>
              <div className="border-t border-dashed border-dark-600 pt-2 mb-2" />
              {ultimaVenda.itens.map((item, i) => (
                <div key={i} className="flex justify-between text-xs mb-1">
                  <div className="flex-1">
                    <p className="text-gray-200">{item.produto}</p>
                    <p className="text-gray-500">{item.quantidade}x {formatCurrency(item.precoUnitario)}</p>
                  </div>
                  <span className="text-gray-200 font-medium">{formatCurrency(item.quantidade * item.precoUnitario)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-dark-600 mt-2 pt-2" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(ultimaVenda.total + ultimaVenda.desconto)}</span>
              </div>
              {ultimaVenda.desconto > 0 && (
                <div className="flex justify-between text-xs text-red-400">
                  <span>Desconto</span>
                  <span>-{formatCurrency(ultimaVenda.desconto)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dark-600">
                <span className="text-gray-100">TOTAL</span>
                <span className="text-accent">{formatCurrency(ultimaVenda.total)}</span>
              </div>
              <div className="text-center mt-3 text-xs text-gray-500 border-t border-dashed border-dark-600 pt-2">
                <p>Obrigado pela preferência!</p>
                <p>Volte sempre!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button fullWidth onClick={imprimirCupom}>
                <Printer size={16} className="mr-2" />Imprimir Cupom
              </Button>
              <Button variant="secondary" onClick={() => setShowCupom(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
