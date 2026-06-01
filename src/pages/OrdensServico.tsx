import { useState, useMemo, useEffect, useCallback } from 'react'
import { listarOrdensServico, salvarOrdemServico, atualizarOrdemServico } from '../services/ordensServico'
import { listarClientes } from '../services/clientes'
import { fetchProdutos } from '../services/produtos'
import { api } from '../services/api'
import type { OrdemServico, OSStatus, Cliente, Veiculo, Produto, User, OSProduto } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { Pagination } from '../components/ui/Pagination'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import { useAuthStore } from '../stores/authStore'
import { Plus, Search } from 'lucide-react'

const statusOS: { value: OSStatus; label: string; variant: 'info' | 'warning' | 'danger' | 'success' | 'muted' }[] = [
  { value: 'aberta', label: 'Aberta', variant: 'info' },
  { value: 'em_andamento', label: 'Em Andamento', variant: 'warning' },
  { value: 'aguardando_peca', label: 'Aguardando Peça', variant: 'danger' },
  { value: 'finalizada', label: 'Finalizada', variant: 'success' },
  { value: 'entregue', label: 'Entregue', variant: 'muted' },
]

const emptyServico = { descricao: '', valor: 0 }
const emptyOSProduto = { nome: '', quantidade: 1, valor: 0 }

export function OrdensServico() {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'admin' || user?.role === 'proprietario' || user?.role === 'gerente'
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<OSStatus | 'todas'>('todas')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState<OrdemServico | null>(null)
  const [editing, setEditing] = useState<OrdemServico | null>(null)
  const pageSize = 6

  const [form, setForm] = useState({
    clienteId: 0, veiculoId: 0, dataEntrada: new Date().toISOString().slice(0, 10),
    dataPrevista: '', responsavel: user?.nome || '', observacoes: '',
    servicos: [] as { descricao: string; valor: number }[],
    produtosOS: [] as OSProduto[],
    valorMaoObra: 0, valorProdutos: 0, desconto: 0, status: 'aberta' as OSStatus,
  })
  const [novoServico, setNovoServico] = useState(emptyServico)
  const [novoProdutoOS, setNovoProdutoOS] = useState(emptyOSProduto)
  const [buscaProduto, setBuscaProduto] = useState('')
  const [showProdutosList, setShowProdutosList] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [o, c, p, u] = await Promise.all([
        listarOrdensServico(),
        listarClientes(),
        fetchProdutos(),
        api.get<User[]>('/users'),
      ])
      setOrdens(o)
      setClientes(c)
      setProdutos(p)
      setUsers(u.filter(u => u.ativo))
      const veicMap: Veiculo[] = await api.get<Veiculo[]>('/veiculos')
      setVeiculos(veicMap)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = ordens
    if (filterStatus !== 'todas') list = list.filter(o => o.status === filterStatus)
    if (search) list = list.filter(o =>
      o.numero.toLowerCase().includes(search.toLowerCase()) ||
      o.clienteNome.toLowerCase().includes(search.toLowerCase()) ||
      o.veiculoPlaca.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [ordens, search, filterStatus])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function getVeiculos(clienteId: number) {
    return veiculos.filter(v => v.clienteId === clienteId)
  }

  function openNew() {
    setEditing(null)
    setForm({
      clienteId: 0, veiculoId: 0, dataEntrada: new Date().toISOString().slice(0, 10),
      dataPrevista: '', responsavel: user?.nome || '', observacoes: '',
      servicos: [], produtosOS: [], valorMaoObra: 0, valorProdutos: 0, desconto: 0, status: 'aberta',
    })
    setModalOpen(true)
  }

  function openEdit(os: OrdemServico) {
    setEditing(os)
    setForm({
      clienteId: os.clienteId, veiculoId: os.veiculoId, dataEntrada: os.dataEntrada,
      dataPrevista: os.dataPrevista, responsavel: os.responsavel, observacoes: os.observacoes,
      servicos: os.servicos, produtosOS: os.produtosOS, valorMaoObra: os.valorMaoObra,
      valorProdutos: os.valorProdutos, desconto: os.desconto, status: os.status,
    })
    setModalOpen(true)
  }

  function addServico() {
    if (!novoServico.descricao.trim()) return
    setForm(p => ({
      ...p,
      servicos: [...p.servicos, { ...novoServico }],
      valorMaoObra: p.valorMaoObra + novoServico.valor,
    }))
    setNovoServico(emptyServico)
  }

  function addProdutoOS() {
    if (!novoProdutoOS.nome.trim()) return
    const prod = produtos.find(p => p.nome.toLowerCase() === novoProdutoOS.nome.toLowerCase())
    const val = prod ? prod.precoVenda : novoProdutoOS.valor
    setForm(p => ({
      ...p,
      produtosOS: [...p.produtosOS, { nome: novoProdutoOS.nome, quantidade: novoProdutoOS.quantidade, valor: val }],
      valorProdutos: p.valorProdutos + (val * novoProdutoOS.quantidade),
    }))
    setNovoProdutoOS(emptyOSProduto)
    setBuscaProduto('')
  }

  function removeServico(idx: number) {
    setForm(p => {
      const servicos = p.servicos.filter((_, i) => i !== idx)
      const valorMaoObra = servicos.reduce((s, sv) => s + sv.valor, 0)
      return { ...p, servicos, valorMaoObra }
    })
  }

  function removeProdutoOS(idx: number) {
    setForm(p => {
      const produtosOS = p.produtosOS.filter((_, i) => i !== idx)
      const valorProdutos = produtosOS.reduce((s, pr) => s + pr.valor * pr.quantidade, 0)
      return { ...p, produtosOS, valorProdutos }
    })
  }

  const handleSave = useCallback(async () => {
    if (!form.clienteId || !form.veiculoId) return
    const cliente = clientes.find(c => c.id === form.clienteId)
    const veiculo = getVeiculos(form.clienteId).find(v => v.id === form.veiculoId)
    if (!cliente || !veiculo) return
    const valorFinal = form.valorMaoObra + form.valorProdutos - form.desconto
    const data = {
      numero: editing?.numero || `OS-${String(ordens.length + 1).padStart(3, '0')}`,
      clienteId: form.clienteId, clienteNome: cliente.nome,
      veiculoId: form.veiculoId, veiculoPlaca: veiculo.placa,
      dataEntrada: form.dataEntrada, dataPrevista: form.dataPrevista,
      responsavel: form.responsavel, observacoes: form.observacoes,
      servicos: form.servicos, produtosOS: form.produtosOS,
      valorMaoObra: form.valorMaoObra, valorProdutos: form.valorProdutos,
      desconto: form.desconto, valorFinal, status: form.status as OSStatus,
    }
    if (editing) {
      const updated = await atualizarOrdemServico(editing.id, data)
      if (updated) setOrdens(prev => prev.map(o => o.id === updated.id ? updated : o))
    } else {
      const created = await salvarOrdemServico(data)
      setOrdens(prev => [...prev, created])
    }
    setModalOpen(false)
  }, [form, editing, clientes, veiculos, ordens.length])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Ordens de Serviço</h1>
        <Button onClick={openNew}><Plus size={16} className="mr-2" />Nova OS</Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent"
              placeholder="Buscar por número, cliente ou placa..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as OSStatus | 'todas'); setPage(1) }}
            className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
            <option value="todas">Todos os status</option>
            {statusOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paged.map(os => (
            <div key={os.id} className="bg-dark-800/50 border border-dark-600 rounded-xl p-4 hover:border-accent/30 transition-all cursor-pointer"
              onClick={() => setDetailOpen(os)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-accent font-semibold text-sm">{os.numero}</span>
                <BadgeStatus label={statusOS.find(s => s.value === os.status)?.label || os.status} variant={statusOS.find(s => s.value === os.status)?.variant || 'info'} />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Cliente</span><span className="text-gray-200">{os.clienteNome}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Veículo</span><span className="text-gray-200">{os.veiculoPlaca}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Entrada</span><span className="text-gray-200">{formatDate(os.dataEntrada)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Valor</span><span className="text-accent font-medium">{formatCurrency(os.valorFinal)}</span></div>
              </div>
              {canEdit && (
                <button onClick={(e) => { e.stopPropagation(); openEdit(os) }}
                  className="mt-3 text-xs text-blue-400 hover:text-blue-300 cursor-pointer">✎ Editar</button>
              )}
            </div>
          ))}
          {paged.length === 0 && (
            <div className="col-span-2 py-8 text-center text-gray-500">Nenhuma ordem de serviço encontrada</div>
          )}
        </div>
        <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar OS' : 'Nova Ordem de Serviço'} size="xl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Cliente</label>
              <select value={form.clienteId} onChange={e => { const cid = parseInt(e.target.value); setForm(p => ({ ...p, clienteId: cid, veiculoId: 0 })) }}
                className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                <option value={0}>Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Veículo</label>
              <select value={form.veiculoId} onChange={e => setForm(p => ({ ...p, veiculoId: parseInt(e.target.value) }))}
                className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                <option value={0}>Selecione...</option>
                {getVeiculos(form.clienteId).map(v => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>)}
              </select>
            </div>
            <Input label="Data de Entrada" type="date" value={form.dataEntrada} onChange={e => setForm(p => ({ ...p, dataEntrada: e.target.value }))} />
            <Input label="Data Prevista" type="date" value={form.dataPrevista} onChange={e => setForm(p => ({ ...p, dataPrevista: e.target.value }))} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Técnico Responsável</label>
              <select value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))}
                className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                <option value="">Selecione...</option>
                {users.filter(u => u.ativo).map(u => (
                  <option key={u.id} value={u.nome}>{u.nome} — {u.role === 'admin' || u.role === 'proprietario' ? 'Proprietário' : u.role === 'gerente' ? 'Gerente' : 'Técnico'}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as OSStatus }))}
                className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                {statusOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <Input label="Observações" value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Serviços</h3>
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1"><Input label="Descrição" value={novoServico.descricao} onChange={e => setNovoServico(p => ({ ...p, descricao: e.target.value }))} /></div>
              <div className="w-32"><Input label="Valor" type="number" value={String(novoServico.valor || '')} onChange={e => setNovoServico(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} /></div>
              <Button variant="secondary" onClick={addServico}>Adicionar</Button>
            </div>
            {form.servicos.map((sv, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg mb-2">
                <span className="text-gray-300 text-sm">{sv.descricao}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{formatCurrency(sv.valor)}</span>
                  <button onClick={() => removeServico(i)} className="text-red-400 hover:text-red-300 text-xs cursor-pointer">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Produtos</h3>
            <div className="flex items-end gap-3 mb-3 relative">
              <div className="flex-1 relative">
                <Input label="Produto" value={buscaProduto} onChange={e => { setBuscaProduto(e.target.value); setShowProdutosList(true); setNovoProdutoOS(p => ({ ...p, nome: e.target.value })) }}
                  onFocus={() => setShowProdutosList(true)} onBlur={() => setTimeout(() => setShowProdutosList(false), 200)} />
                {showProdutosList && buscaProduto && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-600 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                    {produtos
                      .filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase()))
                      .slice(0, 10)
                      .map(p => (
                        <button key={p.id} type="button" className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-dark-600 cursor-pointer border-b border-dark-700 last:border-0"
                          onMouseDown={() => { setBuscaProduto(p.nome); setNovoProdutoOS({ nome: p.nome, quantidade: 1, valor: p.precoVenda }); setShowProdutosList(false) }}>
                          <span className="font-medium">{p.nome}</span>
                          <span className="text-gray-500 ml-2">R$ {p.precoVenda.toFixed(2)}</span>
                        </button>
                      ))}
                    {produtos.filter(p => p.nome.toLowerCase().includes(buscaProduto.toLowerCase())).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">Nenhum produto encontrado</div>
                    )}
                  </div>
                )}
              </div>
            <div className="w-24"><Input label="Qtd" type="number" value={String(novoProdutoOS.quantidade || '')} onChange={e => setNovoProdutoOS(p => ({ ...p, quantidade: parseInt(e.target.value) || 1 }))} /></div>
              <div className="w-28"><Input label="Valor unit." type="number" step={0.01} value={String(novoProdutoOS.valor || '')} onChange={e => setNovoProdutoOS(p => ({ ...p, valor: parseFloat(e.target.value) || 0 }))} /></div>
              <Button variant="secondary" onClick={addProdutoOS}>Adicionar</Button>
            </div>
            {form.produtosOS.map((pr, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg mb-2">
                <span className="text-gray-300 text-sm">{pr.nome} x{pr.quantidade}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{formatCurrency(pr.valor * pr.quantidade)}</span>
                  <button onClick={() => removeProdutoOS(i)} className="text-red-400 hover:text-red-300 text-xs cursor-pointer">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-dark-600">
            <div className="text-center">
              <span className="text-xs text-gray-500">Mão de Obra</span>
              <p className="text-lg font-semibold text-gray-200">{formatCurrency(form.valorMaoObra)}</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">Produtos</span>
              <p className="text-lg font-semibold text-gray-200">{formatCurrency(form.valorProdutos)}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400">Desconto</label>
              <input type="number" value={form.desconto || ''} onChange={e => setForm(p => ({ ...p, desconto: parseFloat(e.target.value) || 0 }))}
                className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent" />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-accent/10 rounded-xl">
            <span className="text-sm font-semibold text-gray-300">Valor Final</span>
            <span className="text-xl font-bold text-accent">{formatCurrency(form.valorMaoObra + form.valorProdutos - form.desconto)}</span>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar OS</Button>
          </div>
        </div>
      </Modal>

      <Modal open={detailOpen !== null} onClose={() => setDetailOpen(null)} title={`OS ${detailOpen?.numero || ''}`} size="lg">
        {detailOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Cliente:</span> <span className="text-gray-200 ml-2">{detailOpen.clienteNome}</span></div>
              <div><span className="text-gray-500">Veículo:</span> <span className="text-gray-200 ml-2">{detailOpen.veiculoPlaca}</span></div>
              <div><span className="text-gray-500">Entrada:</span> <span className="text-gray-200 ml-2">{formatDate(detailOpen.dataEntrada)}</span></div>
              <div><span className="text-gray-500">Previsão:</span> <span className="text-gray-200 ml-2">{formatDate(detailOpen.dataPrevista)}</span></div>
              <div><span className="text-gray-500">Responsável:</span> <span className="text-gray-200 ml-2">{detailOpen.responsavel}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="ml-2"><BadgeStatus label={statusOS.find(s => s.value === detailOpen.status)?.label || ''} variant={statusOS.find(s => s.value === detailOpen.status)?.variant || 'info'} /></span></div>
            </div>
            {detailOpen.observacoes && (<div className="text-sm"><span className="text-gray-500">Obs:</span> <span className="text-gray-400 ml-2">{detailOpen.observacoes}</span></div>)}
            {detailOpen.servicos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Serviços</h4>
                {detailOpen.servicos.map((sv, i) => (
                  <div key={i} className="flex justify-between py-1.5 text-sm"><span className="text-gray-300">{sv.descricao}</span><span className="text-gray-400">{formatCurrency(sv.valor)}</span></div>
                ))}
              </div>
            )}
            {(detailOpen as any).produtosOS?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Produtos</h4>
                {(detailOpen as any).produtosOS?.map((pr: any, i: number) => (
                  <div key={i} className="flex justify-between py-1.5 text-sm"><span className="text-gray-300">{pr.nome} x{pr.quantidade}</span><span className="text-gray-400">{formatCurrency(pr.valor * pr.quantidade)}</span></div>
                ))}
              </div>
            )}
            <div className="border-t border-dark-600 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Mão de obra</span><span className="text-gray-300">{formatCurrency(detailOpen.valorMaoObra)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Produtos</span><span className="text-gray-300">{formatCurrency(detailOpen.valorProdutos)}</span></div>
              {detailOpen.desconto > 0 && <div className="flex justify-between"><span className="text-gray-500">Desconto</span><span className="text-red-400">-{formatCurrency(detailOpen.desconto)}</span></div>}
              <div className="flex justify-between pt-2 border-t border-dark-600"><span className="text-gray-300 font-semibold">Total</span><span className="text-accent font-bold text-lg">{formatCurrency(detailOpen.valorFinal)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
