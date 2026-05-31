import { useState, useEffect } from 'react'
import { listarClientes, salvarCliente, atualizarCliente, excluirCliente, listarVeiculos, salvarVeiculo, consultarPlaca } from '../services/clientes'
import { listarOrdensServico } from '../services/ordensServico'
import { fetchProdutos } from '../services/produtos'
import type { Cliente, Veiculo, OrdemServico, Produto } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Pagination } from '../components/ui/Pagination'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/format'
import { useAuthStore } from '../stores/authStore'
import { Search, UserPlus, Car, History, ShoppingCart, Wrench } from 'lucide-react'

const emptyCliente = {
  nome: '', cpf: '', rg: '', telefone: '', whatsapp: '', email: '',
  cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
}

const emptyVeiculo = {
  placa: '', marca: '', modelo: '', ano: 0, cor: '', chassi: '',
  renavam: '', combustivel: '', quilometragem: 0,
}

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export function Clientes() {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'proprietario' || user?.role === 'gerente'
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<Record<number, Veiculo[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(emptyCliente)

  const [veiculoModalOpen, setVeiculoModalOpen] = useState(false)
  const [veiculoCliente, setVeiculoCliente] = useState<Cliente | null>(null)
  const [veiculoForm, setVeiculoForm] = useState(emptyVeiculo)
  const [consultando, setConsultando] = useState(false)

  const [historicoModal, setHistoricoModal] = useState<Cliente | null>(null)
  const [historicoVendas, setHistoricoVendas] = useState<Produto[]>([])
  const [historicoOrdens, setHistoricoOrdens] = useState<OrdemServico[]>([])

  const pageSize = 5

  useEffect(() => {
    async function load() {
      setLoading(true)
      const c = await listarClientes()
      setClientes(c)
      const veicMap: Record<number, Veiculo[]> = {}
      await Promise.all(c.map(async (cl) => {
        const v = await listarVeiculos(cl.id)
        if (v.length > 0) veicMap[cl.id] = v
      }))
      setVeiculos(veicMap)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search)
  )
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function openNew() { setEditing(null); setForm(emptyCliente); setModalOpen(true) }
  function openEdit(c: Cliente) { setEditing(c); setForm(c); setModalOpen(true) }

  async function handleSave() {
    if (!form.nome.trim()) return
    if (editing) {
      const updated = await atualizarCliente(editing.id, form)
      setClientes(prev => prev.map(c => c.id === editing.id ? { ...c, ...updated } : c))
    } else {
      const created = await salvarCliente(form)
      setClientes(prev => [...prev, created])
    }
    setModalOpen(false)
  }

  async function handleDelete(id: number) {
    await excluirCliente(id)
    setClientes(prev => prev.filter(c => c.id !== id))
    setConfirmDelete(null)
  }

  async function handleConsultarPlaca() {
    const placa = veiculoForm.placa
    if (!placa || placa.length < 7) return
    setConsultando(true)
    const dados = await consultarPlaca(placa)
    if (dados) {
      setVeiculoForm(prev => ({ ...prev, ...dados }))
    }
    setConsultando(false)
  }

  async function handleSaveVeiculo() {
    if (!veiculoCliente || !veiculoForm.placa.trim()) return
    const created = await salvarVeiculo({ ...veiculoForm, clienteId: veiculoCliente.id })
    setVeiculos(prev => ({
      ...prev,
      [veiculoCliente.id]: [...(prev[veiculoCliente.id] || []), created],
    }))
    setVeiculoModalOpen(false)
    setVeiculoForm(emptyVeiculo)
  }

  function openVeiculo(c: Cliente) {
    setVeiculoCliente(c)
    setVeiculoForm(emptyVeiculo)
    setVeiculoModalOpen(true)
  }

  function getVeiculos(clienteId: number) {
    return veiculos[clienteId] || []
  }

  async function openHistorico(c: Cliente) {
    setHistoricoModal(c)
    const [vendasData, ordensData] = await Promise.all([
      fetchProdutos(),
      listarOrdensServico(),
    ])
    setHistoricoVendas(vendasData.filter(p => p.fornecedor === c.nome).slice(0, 3))
    setHistoricoOrdens(ordensData.filter(os => os.clienteId === c.id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Clientes</h1>
        {canEdit && (
          <Button onClick={openNew}><UserPlus size={16} className="mr-2" />Novo Cliente</Button>
        )}
      </div>

      <Card>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent"
            placeholder="Buscar por nome, CPF, email ou telefone..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-dark-600">
                <th className="text-left py-3 px-2">Nome</th>
                <th className="text-left py-3 px-2">CPF</th>
                <th className="text-left py-3 px-2">Telefone</th>
                <th className="text-left py-3 px-2">Email</th>
                <th className="text-left py-3 px-2">Cidade</th>
                <th className="text-center py-3 px-2">Veículos</th>
                <th className="text-center py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr key={c.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="py-3 px-2 font-medium text-gray-200">{c.nome}</td>
                  <td className="py-3 px-2 text-gray-400">{c.cpf}</td>
                  <td className="py-3 px-2 text-gray-400">{c.telefone}</td>
                  <td className="py-3 px-2 text-gray-400">{c.email}</td>
                  <td className="py-3 px-2 text-gray-400">{c.cidade}/{c.estado}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-dark-700 text-xs font-medium text-gray-300">
                      {getVeiculos(c.id).length}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openVeiculo(c)} className="text-gray-500 hover:text-blue-400 transition-colors cursor-pointer" title="Adicionar Veículo"><Car size={16} /></button>
                      <button onClick={() => openHistorico(c)} className="text-gray-500 hover:text-accent transition-colors cursor-pointer" title="Histórico"><History size={16} /></button>
                      <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-blue-400 transition-colors cursor-pointer" title="Editar">✎</button>
                      <button onClick={() => setConfirmDelete(c.id)} className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer" title="Excluir">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">Nenhum cliente encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome Completo" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
          <Input label="CPF" value={form.cpf} onChange={e => setForm(p => ({ ...p, cpf: e.target.value }))} />
          <Input label="RG" value={form.rg} onChange={e => setForm(p => ({ ...p, rg: e.target.value }))} />
          <Input label="Telefone" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} />
          <Input label="WhatsApp" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
          <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          <Input label="CEP" value={form.cep} onChange={e => setForm(p => ({ ...p, cep: e.target.value }))} />
          <Input label="Endereço" value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))} />
          <Input label="Número" value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))} />
          <Input label="Bairro" value={form.bairro} onChange={e => setForm(p => ({ ...p, bairro: e.target.value }))} />
          <Input label="Cidade" value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-400">Estado</label>
            <select value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}
              className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
              <option value="">Selecione...</option>
              {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </Modal>

      <Modal open={veiculoModalOpen} onClose={() => setVeiculoModalOpen(false)} title={`Veículo - ${veiculoCliente?.nome || ''}`} size="lg">
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input label="Placa" value={veiculoForm.placa} onChange={e => setVeiculoForm(p => ({ ...p, placa: e.target.value.toUpperCase() }))}
                placeholder="ABC1D23" maxLength={7} />
            </div>
            <Button variant="secondary" onClick={handleConsultarPlaca} disabled={consultando}>
              {consultando ? 'Consultando...' : 'Consultar Veículo'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Marca" value={veiculoForm.marca} onChange={e => setVeiculoForm(p => ({ ...p, marca: e.target.value }))} />
            <Input label="Modelo" value={veiculoForm.modelo} onChange={e => setVeiculoForm(p => ({ ...p, modelo: e.target.value }))} />
            <Input label="Ano" type="number" value={String(veiculoForm.ano || '')} onChange={e => setVeiculoForm(p => ({ ...p, ano: parseInt(e.target.value) || 0 }))} />
            <Input label="Cor" value={veiculoForm.cor} onChange={e => setVeiculoForm(p => ({ ...p, cor: e.target.value }))} />
            <Input label="Chassi" value={veiculoForm.chassi} onChange={e => setVeiculoForm(p => ({ ...p, chassi: e.target.value }))} />
            <Input label="Renavam" value={veiculoForm.renavam} onChange={e => setVeiculoForm(p => ({ ...p, renavam: e.target.value }))} />
            <Input label="Combustível" value={veiculoForm.combustivel} onChange={e => setVeiculoForm(p => ({ ...p, combustivel: e.target.value }))} />
            <Input label="Quilometragem" type="number" value={String(veiculoForm.quilometragem || '')} onChange={e => setVeiculoForm(p => ({ ...p, quilometragem: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setVeiculoModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveVeiculo}>Salvar Veículo</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Excluir Cliente"
        message="Tem certeza que deseja excluir este cliente?"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />

      <Modal open={historicoModal !== null} onClose={() => setHistoricoModal(null)} title={`Histórico - ${historicoModal?.nome || ''}`} size="xl">
        {historicoModal && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><ShoppingCart size={16} />Compras</h3>
              {historicoVendas.length > 0 ? (
                <div className="space-y-2">
                  {historicoVendas.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg">
                      <span className="text-gray-300">{p.nome}</span>
                      <span className="text-gray-400 text-sm">{formatCurrency(p.precoVenda)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">Nenhuma compra registrada</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Wrench size={16} />Serviços</h3>
              {historicoOrdens.length > 0 ? (
                <div className="space-y-2">
                  {historicoOrdens.map(os => (
                    <div key={os.id} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg">
                      <div>
                        <span className="text-gray-300">{os.veiculoPlaca} — {os.numero}</span>
                        <span className="text-gray-500 text-xs ml-2">{formatDate(os.dataEntrada)}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{formatCurrency(os.valorFinal)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">Nenhum serviço realizado</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
