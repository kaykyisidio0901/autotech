import { useState, useRef } from 'react'
import { mockDadosEmpresa, mockDadosFiscais, mockComissoes, mockOficinaConfig, mockImpressaoConfig, mockMensagensWhatsApp, mockBackupConfig, mockDashboardWidgets, mockLicencaInfo, estadosBr, regimesTributarios } from '../mock/configuracoes'
import { mockUsers } from '../mock/users'
import type { User, ComissaoConfig, MensagemWhatsApp } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { formatCurrency } from '../utils/format'
import { useAuthStore } from '../stores/authStore'
import {
  Building2, FileText, Users, Percent,
  Wrench, Printer, MessageSquare, HardDrive,
  LayoutDashboard, ShieldCheck, Save, UserPlus,
  Upload, Eye, Download, ToggleLeft, Check,
  X, Plus, Trash2,
} from 'lucide-react'

const tabs = [
  { id: 'empresa', label: 'Dados da Empresa', icon: <Building2 size={18} /> },
  { id: 'fiscal', label: 'Dados Fiscais', icon: <FileText size={18} /> },
  { id: 'usuarios', label: 'Usuários e Permissões', icon: <Users size={18} /> },
  { id: 'comissao', label: 'Comissões', icon: <Percent size={18} /> },
  { id: 'oficina', label: 'Oficina', icon: <Wrench size={18} /> },
  { id: 'impressao', label: 'Impressões', icon: <Printer size={18} /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare size={18} /> },
  { id: 'backup', label: 'Backup', icon: <HardDrive size={18} /> },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'licenca', label: 'Assinatura', icon: <ShieldCheck size={18} /> },
]

export function Configuracoes() {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'proprietario'
  const [activeTab, setActiveTab] = useState('empresa')
  const [saved, setSaved] = useState(false)

  // --- Dados da Empresa ---
  const [empresa, setEmpresa] = useState({ ...mockDadosEmpresa })
  const logoRef = useRef<HTMLInputElement>(null)
  const logoSmallRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSmallPreview, setLogoSmallPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, setPreview: (v: string | null) => void) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // --- Dados Fiscais ---
  const [fiscal, setFiscal] = useState({ ...mockDadosFiscais })

  // --- Usuários ---
  const emptyUserForm = { nome: '', email: '', telefone: '', cargo: '', senha: '', role: 'funcionario' as User['role'] }
  const [users, setUsers] = useState(mockUsers)
  const [userModal, setUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState(emptyUserForm)

  function openNewUser() {
    setEditingUser(null)
    setUserForm(emptyUserForm)
    setUserModal(true)
  }

  function openEditUser(u: User) {
    setEditingUser(u)
    setUserForm({ nome: u.nome, email: u.email, telefone: (u as any).telefone || '', cargo: (u as any).cargo || '', senha: u.senha, role: u.role })
    setUserModal(true)
  }

  // --- Comissões ---
  const [comissoes, setComissoes] = useState<ComissaoConfig[]>(mockComissoes)
  const [comModal, setComModal] = useState(false)
  const [comForm, setComForm] = useState<ComissaoConfig>({ funcionarioId: 0, nome: '', percentual: 0, tipo: 'venda' })

  // --- Oficina ---
  const [oficina, setOficina] = useState({ ...mockOficinaConfig })
  const [novoTecnico, setNovoTecnico] = useState('')

  // --- Impressão ---
  const [impressao, setImpressao] = useState({ ...mockImpressaoConfig })

  // --- WhatsApp ---
  const [mensagens, setMensagens] = useState<MensagemWhatsApp[]>(mockMensagensWhatsApp)
  const [editMsg, setEditMsg] = useState<MensagemWhatsApp | null>(null)
  const [msgForm, setMsgForm] = useState({ titulo: '', mensagem: '' })

  // --- Backup ---
  const [backup, setBackup] = useState({ ...mockBackupConfig })

  // --- Dashboard Widgets ---
  const [widgets, setWidgets] = useState(mockDashboardWidgets)

  // --- Licença ---
  const [licenca] = useState({ ...mockLicencaInfo })

  // --- Simulação comissão ---
  const [simVendas, setSimVendas] = useState(10000)
  const [simServicos, setSimServicos] = useState(5000)

  function simularComissao(com: ComissaoConfig) {
    const base = com.tipo === 'venda' ? simVendas : com.tipo === 'servico' ? simServicos : simVendas + simServicos
    return base * (com.percentual / 100)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addUser() {
    if (!userForm.nome.trim() || !userForm.email.trim()) return
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u))
    } else {
      const id = Math.max(...users.map(u => u.id), 0) + 1
      setUsers(prev => [...prev, { id, ...userForm, ativo: true }])
    }
    setUserModal(false)
    setEditingUser(null)
  }

  function toggleUserStatus(userId: number) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ativo: !u.ativo } : u))
  }

  function addComissao() {
    if (!comForm.funcionarioId) return
    const func = users.find(u => u.id === comForm.funcionarioId)
    setComissoes(prev => [...prev, { ...comForm, nome: func?.nome || '' }])
    setComModal(false)
    setComForm({ funcionarioId: 0, nome: '', percentual: 0, tipo: 'venda' })
  }

  function removeComissao(idx: number) {
    setComissoes(prev => prev.filter((_, i) => i !== idx))
  }

  function addTecnico() {
    if (!novoTecnico.trim()) return
    setOficina(prev => ({ ...prev, tecnicos: [...prev.tecnicos, novoTecnico.trim()] }))
    setNovoTecnico('')
  }

  function removeTecnico(idx: number) {
    setOficina(prev => ({ ...prev, tecnicos: prev.tecnicos.filter((_, i) => i !== idx) }))
  }

  function toggleWidget(id: string) {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ativo: !w.ativo } : w))
  }

  function openMsgEditor(msg: MensagemWhatsApp) {
    setEditMsg(msg)
    setMsgForm({ titulo: msg.titulo, mensagem: msg.mensagem })
  }

  function saveMsg() {
    if (!editMsg) return
    setMensagens(prev => prev.map(m => m.tipo === editMsg.tipo ? { ...m, titulo: msgForm.titulo, mensagem: msgForm.mensagem } : m))
    setEditMsg(null)
  }

  function handleBackup() {
    const now = new Date()
    setBackup(prev => ({
      ...prev,
      ultimoBackup: now.toLocaleString('pt-BR'),
      tamanho: `${(45 + Math.random() * 10).toFixed(1)} MB`,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todos os aspectos do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-400 text-sm flex items-center gap-1"><Check size={14} />Salvo!</span>}
          <Button onClick={handleSave}><Save size={16} className="mr-2" />Salvar Tudo</Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-accent/15 text-accent font-medium' : 'text-gray-400 hover:bg-dark-800 hover:text-gray-200'
              }`}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {/* === ABA 1: DADOS DA EMPRESA === */}
          {activeTab === 'empresa' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações da Empresa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Razão Social" value={empresa.razaoSocial} onChange={e => setEmpresa(p => ({ ...p, razaoSocial: e.target.value }))} />
                  <Input label="Nome Fantasia" value={empresa.nomeFantasia} onChange={e => setEmpresa(p => ({ ...p, nomeFantasia: e.target.value }))} />
                  <Input label="CNPJ" value={empresa.cnpj} onChange={e => setEmpresa(p => ({ ...p, cnpj: e.target.value }))} />
                  <Input label="Inscrição Estadual" value={empresa.ie} onChange={e => setEmpresa(p => ({ ...p, ie: e.target.value }))} />
                  <Input label="Telefone" value={empresa.telefone} onChange={e => setEmpresa(p => ({ ...p, telefone: e.target.value }))} />
                  <Input label="WhatsApp" value={empresa.whatsapp} onChange={e => setEmpresa(p => ({ ...p, whatsapp: e.target.value }))} />
                  <Input label="E-mail" value={empresa.email} onChange={e => setEmpresa(p => ({ ...p, email: e.target.value }))} />
                  <Input label="Site" value={empresa.site} onChange={e => setEmpresa(p => ({ ...p, site: e.target.value }))} />
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="CEP" value={empresa.cep} onChange={e => setEmpresa(p => ({ ...p, cep: e.target.value }))} />
                  <Input label="Endereço" value={empresa.endereco} onChange={e => setEmpresa(p => ({ ...p, endereco: e.target.value }))} />
                  <Input label="Número" value={empresa.numero} onChange={e => setEmpresa(p => ({ ...p, numero: e.target.value }))} />
                  <Input label="Bairro" value={empresa.bairro} onChange={e => setEmpresa(p => ({ ...p, bairro: e.target.value }))} />
                  <Input label="Cidade" value={empresa.cidade} onChange={e => setEmpresa(p => ({ ...p, cidade: e.target.value }))} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Estado</label>
                    <select value={empresa.estado} onChange={e => setEmpresa(p => ({ ...p, estado: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                      {estadosBr.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Logos e Favicon</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Logo Principal</p>
                    <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-all" onClick={() => logoRef.current?.click()}>
                      {logoPreview ? <img src={logoPreview} alt="Logo" className="max-h-20 mx-auto" /> : <Upload size={32} className="mx-auto text-gray-600 mb-2" />}
                      <p className="text-xs text-gray-500">{logoPreview ? 'Clique para trocar' : 'Upload da logo'}</p>
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e, setLogoPreview)} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Logo Reduzida</p>
                    <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-all" onClick={() => logoSmallRef.current?.click()}>
                      {logoSmallPreview ? <img src={logoSmallPreview} alt="Logo reduzida" className="max-h-12 mx-auto" /> : <Upload size={32} className="mx-auto text-gray-600 mb-2" />}
                      <p className="text-xs text-gray-500">{logoSmallPreview ? 'Clique para trocar' : 'Upload da logo reduzida'}</p>
                    </div>
                    <input ref={logoSmallRef} type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e, setLogoSmallPreview)} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Favicon</p>
                    <div className="border-2 border-dashed border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-all" onClick={() => faviconRef.current?.click()}>
                      {faviconPreview ? <img src={faviconPreview} alt="Favicon" className="max-h-12 mx-auto" /> : <Upload size={32} className="mx-auto text-gray-600 mb-2" />}
                      <p className="text-xs text-gray-500">{faviconPreview ? 'Clique para trocar' : 'Upload do favicon'}</p>
                    </div>
                    <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(e, setFaviconPreview)} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* === ABA 3: DADOS FISCAIS === */}
          {activeTab === 'fiscal' && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Configurações Fiscais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Regime Tributário</label>
                  <select value={fiscal.regimeTributario} onChange={e => setFiscal(p => ({ ...p, regimeTributario: e.target.value }))}
                    className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                    {regimesTributarios.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <Input label="CNAE" value={fiscal.cnae} onChange={e => setFiscal(p => ({ ...p, cnae: e.target.value }))} />
                <Input label="Inscrição Municipal" value={fiscal.inscricaoMunicipal} onChange={e => setFiscal(p => ({ ...p, inscricaoMunicipal: e.target.value }))} />
                <Input label="Série da Nota Fiscal" value={fiscal.serieNotaFiscal} onChange={e => setFiscal(p => ({ ...p, serieNotaFiscal: e.target.value }))} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-400">Ambiente Fiscal</label>
                  <div className="flex gap-3">
                    {(['homologacao', 'producao'] as const).map(amb => (
                      <button key={amb} onClick={() => setFiscal(p => ({ ...p, ambienteFiscal: amb }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                          fiscal.ambienteFiscal === amb ? 'border-accent bg-accent/10 text-accent' : 'border-dark-600 text-gray-400'
                        }`}>
                        {amb === 'homologacao' ? 'Homologação' : 'Produção'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-400 flex items-center gap-2"><FileText size={16} />Interface preparada para futura integração com sistemas fiscais.</p>
              </div>
            </Card>
          )}

          {/* === ABA 4: USUÁRIOS E PERMISSÕES === */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Usuários do Sistema</h2>
                  <Button onClick={openNewUser}>
                    <UserPlus size={16} className="mr-2" />Novo Usuário
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-dark-600">
                        <th className="text-left py-3 px-2">Nome</th>
                        <th className="text-left py-3 px-2">Email</th>
                        <th className="text-left py-3 px-2">Cargo</th>
                        <th className="text-center py-3 px-2">Status</th>
                        <th className="text-center py-3 px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                          <td className="py-3 px-2 font-medium text-gray-200">{u.nome}</td>
                          <td className="py-3 px-2 text-gray-400">{u.email}</td>
                          <td className="py-3 px-2">
                            <BadgeStatus label={u.role === 'proprietario' ? 'Proprietário' : u.role === 'gerente' ? 'Gerente' : 'Funcionário'}
                              variant={u.role === 'proprietario' ? 'info' : u.role === 'gerente' ? 'warning' : 'muted'} />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <BadgeStatus label={u.ativo ? 'Ativo' : 'Inativo'} variant={u.ativo ? 'success' : 'danger'} />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditUser(u)}
                                className="text-gray-500 hover:text-blue-400 cursor-pointer" title="Editar">✎</button>
                              {u.id !== user?.id && (
                                <button onClick={() => toggleUserStatus(u.id)}
                                  className={`cursor-pointer ${u.ativo ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`} title={u.ativo ? 'Desativar' : 'Ativar'}>
                                  {u.ativo ? <X size={14} /> : <Check size={14} />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {isOwner && (
                <Card>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Matriz de Permissões</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b border-dark-600">
                          <th className="text-left py-3 px-2">Módulo</th>
                          <th className="text-center py-3 px-2">Proprietário</th>
                          <th className="text-center py-3 px-2">Gerente</th>
                          <th className="text-center py-3 px-2">Funcionário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { mod: 'Dashboard', p: '✓', g: '✓', f: '✓' },
                          { mod: 'PDV / Vendas', p: '✓', g: '✓', f: '✓' },
                          { mod: 'Produtos', p: '✓', g: '✓', f: '—' },
                          { mod: 'Estoque', p: '✓', g: '✓', f: '—' },
                          { mod: 'Financeiro', p: '✓', g: '✓', f: '—' },
                          { mod: 'Relatórios', p: '✓', g: '✓', f: '—' },
                          { mod: 'Clientes', p: '✓', g: '✓', f: '✓' },
                          { mod: 'Ordens de Serviço', p: '✓', g: '✓', f: '✓' },
                          { mod: 'Configurações', p: '✓', g: '—', f: '—' },
                          { mod: 'Usuários', p: '✓', g: '—', f: '—' },
                          { mod: 'Comissões', p: '✓', g: '—', f: '—' },
                          { mod: 'Importar XML', p: '✓', g: '✓', f: '—' },
                        ].map(row => (
                          <tr key={row.mod} className="border-b border-dark-700">
                            <td className="py-2.5 px-2 text-gray-300">{row.mod}</td>
                            <td className="py-2.5 px-2 text-center text-green-400">{row.p}</td>
                            <td className="py-2.5 px-2 text-center text-yellow-400">{row.g}</td>
                            <td className="py-2.5 px-2 text-center" style={{ color: row.f === '✓' ? '#10b981' : '#6b7280' }}>{row.f}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
              <Modal open={userModal} onClose={() => setUserModal(false)} title={editingUser ? 'Editar Usuário' : 'Novo Usuário'} size="md">
                <div className="space-y-4">
                  <Input label="Nome" value={userForm.nome} onChange={e => setUserForm(p => ({ ...p, nome: e.target.value }))} />
                  <Input label="E-mail" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                  <Input label="Telefone" value={userForm.telefone} onChange={e => setUserForm(p => ({ ...p, telefone: e.target.value }))} />
                  <Input label="Cargo" value={userForm.cargo} onChange={e => setUserForm(p => ({ ...p, cargo: e.target.value }))} />
                  <Input label="Senha" type="password" value={userForm.senha} onChange={e => setUserForm(p => ({ ...p, senha: e.target.value }))} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Perfil de Acesso</label>
                    <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value as User['role'] }))}
                      className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                      <option value="funcionario">Funcionário</option>
                      <option value="gerente">Gerente</option>
                      <option value="proprietario">Proprietário</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setUserModal(false)}>Cancelar</Button>
                    <Button onClick={addUser}>Salvar</Button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {/* === ABA 5: COMISSÕES === */}
          {activeTab === 'comissao' && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Configuração de Comissões</h2>
                  <Button onClick={() => setComModal(true)}><Plus size={16} className="mr-2" />Nova Comissão</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-dark-600">
                        <th className="text-left py-3 px-2">Funcionário</th>
                        <th className="text-left py-3 px-2">Tipo</th>
                        <th className="text-center py-3 px-2">%</th>
                        <th className="text-right py-3 px-2">Simulação</th>
                        <th className="text-center py-3 px-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comissoes.map((com, i) => (
                        <tr key={i} className="border-b border-dark-700 hover:bg-dark-700/50">
                          <td className="py-3 px-2 font-medium text-gray-200">{com.nome}</td>
                          <td className="py-3 px-2 text-gray-400">{com.tipo === 'venda' ? 'Venda' : com.tipo === 'servico' ? 'Serviço' : `${com.tipo}${com.categoriaAlvo ? ` (${com.categoriaAlvo})` : ''}`}</td>
                          <td className="py-3 px-2 text-center text-gray-200">{com.percentual}%</td>
                          <td className="py-3 px-2 text-right text-accent font-medium">{formatCurrency(simularComissao(com))}</td>
                          <td className="py-3 px-2 text-center">
                            <button onClick={() => removeComissao(i)} className="text-red-400 hover:text-red-300 cursor-pointer"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Simulador de Comissões</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input label="Base Vendas (R$)" type="number" value={String(simVendas)} onChange={e => setSimVendas(Number(e.target.value) || 0)} />
                  <Input label="Base Serviços (R$)" type="number" value={String(simServicos)} onChange={e => setSimServicos(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  {comissoes.map((com, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg text-sm">
                      <span className="text-gray-300">{com.nome} <span className="text-gray-500">({com.tipo} — {com.percentual}%)</span></span>
                      <span className="text-accent font-medium">{formatCurrency(simularComissao(com))}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Modal open={comModal} onClose={() => setComModal(false)} title="Nova Comissão" size="md">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Funcionário</label>
                    <select value={comForm.funcionarioId} onChange={e => setComForm(p => ({ ...p, funcionarioId: Number(e.target.value) }))}
                      className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                      <option value={0}>Selecione...</option>
                      {users.filter(u => u.ativo).map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Tipo</label>
                    <select value={comForm.tipo} onChange={e => setComForm(p => ({ ...p, tipo: e.target.value as ComissaoConfig['tipo'] }))}
                      className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                      <option value="venda">Por Venda</option>
                      <option value="servico">Por Serviço</option>
                      <option value="categoria">Por Categoria</option>
                    </select>
                  </div>
                  <Input label="Percentual (%)" type="number" step={0.1} value={String(comForm.percentual || '')} onChange={e => setComForm(p => ({ ...p, percentual: Number(e.target.value) || 0 }))} />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setComModal(false)}>Cancelar</Button>
                    <Button onClick={addComissao}>Adicionar</Button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {/* === ABA 6: OFICINA === */}
          {activeTab === 'oficina' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Configurações da Oficina</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Tempo Médio dos Serviços (min)" type="number" value={String(oficina.tempoMedioServicos)} onChange={e => setOficina(p => ({ ...p, tempoMedioServicos: Number(e.target.value) || 0 }))} />
                  <Input label="Garantia Padrão (dias)" type="number" value={String(oficina.garantiaPadrao)} onChange={e => setOficina(p => ({ ...p, garantiaPadrao: Number(e.target.value) || 0 }))} />
                  <div className="md:col-span-2">
                    <Input label="Mensagem Padrão da OS" value={oficina.mensagemPadraoOS} onChange={e => setOficina(p => ({ ...p, mensagemPadraoOS: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Observações Automáticas" value={oficina.observacoesAutomaticas} onChange={e => setOficina(p => ({ ...p, observacoesAutomaticas: e.target.value }))} />
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Técnicos / Instaladores</h2>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <div className="flex-1"><Input label="Adicionar Técnico" value={novoTecnico} onChange={e => setNovoTecnico(e.target.value)} placeholder="Nome do técnico" /></div>
                  <Button variant="secondary" onClick={addTecnico}><Plus size={16} /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {oficina.tecnicos.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-dark-700 rounded-lg text-sm">
                      <Wrench size={14} className="text-gray-500" />
                      <span className="text-gray-300">{t}</span>
                      <button onClick={() => removeTecnico(i)} className="text-red-400 hover:text-red-300 cursor-pointer"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* === ABA 7: IMPRESSÕES === */}
          {activeTab === 'impressao' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Cabeçalho e Rodapé</h2>
                <div className="space-y-4">
                  <Input label="Cabeçalho" value={impressao.cabecalho} onChange={e => setImpressao(p => ({ ...p, cabecalho: e.target.value }))} />
                  <Input label="Rodapé" value={impressao.rodape} onChange={e => setImpressao(p => ({ ...p, rodape: e.target.value }))} />
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Aplicar em</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['os', 'orcamentos', 'relatorios', 'comprovantes'] as const).map(key => (
                    <button key={key} onClick={() => setImpressao(p => ({ ...p, aplicarEm: { ...p.aplicarEm, [key]: !p.aplicarEm[key] } }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        impressao.aplicarEm[key] ? 'border-accent bg-accent/10 text-accent' : 'border-dark-600 text-gray-400'
                      }`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${impressao.aplicarEm[key] ? 'border-accent bg-accent' : 'border-dark-500'}`}>
                        {impressao.aplicarEm[key] && <Check size={12} className="text-white" />}
                      </div>
                      {key === 'os' ? 'Ordem de Serviço' : key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Pré-visualização</h2>
                <div className="border border-dark-600 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-dark-700/50 text-center border-b border-dark-600">
                    <p className="text-sm text-gray-300 font-medium">{impressao.cabecalho}</p>
                  </div>
                  <div className="p-6 text-sm text-gray-400">
                    <p>AutoTech Manager</p>
                    <p className="text-xs text-gray-600 mt-2">Conteúdo do documento será renderizado aqui...</p>
                  </div>
                  <div className="px-4 py-3 bg-dark-700/50 text-center border-t border-dark-600">
                    <p className="text-xs text-gray-500">{impressao.rodape}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* === ABA 8: WHATSAPP === */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Número Principal</h2>
                <Input label="WhatsApp" value={empresa.whatsapp} onChange={e => setEmpresa(p => ({ ...p, whatsapp: e.target.value }))} placeholder="5511999999999" />
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Mensagens Automáticas</h2>
                <div className="space-y-3">
                  {mensagens.map(msg => (
                    <div key={msg.tipo} className="bg-dark-800/50 border border-dark-600 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-200">{msg.titulo}</h3>
                        <Button variant="ghost" onClick={() => openMsgEditor(msg)}>✎ Editar</Button>
                      </div>
                      <p className="text-xs text-gray-500 bg-dark-900 rounded-lg p-3">{msg.mensagem}</p>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-700 text-gray-500">{'{cliente}'}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-700 text-gray-500">{'{valor}'}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-700 text-gray-500">{'{placa}'}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-700 text-gray-500">{'{vencimento}'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Modal open={editMsg !== null} onClose={() => setEditMsg(null)} title={`Editar: ${editMsg?.titulo || ''}`} size="lg">
                <div className="space-y-4">
                  <Input label="Título" value={msgForm.titulo} onChange={e => setMsgForm(p => ({ ...p, titulo: e.target.value }))} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Mensagem</label>
                    <textarea value={msgForm.mensagem} onChange={e => setMsgForm(p => ({ ...p, mensagem: e.target.value }))}
                      className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent min-h-[120px] resize-y" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['{cliente}', '{valor}', '{placa}', '{vencimento}'].map(tag => (
                      <button key={tag} onClick={() => setMsgForm(p => ({ ...p, mensagem: p.mensagem + ' ' + tag }))}
                        className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-400 hover:text-gray-200 cursor-pointer">{tag}</button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setEditMsg(null)}>Cancelar</Button>
                    <Button onClick={saveMsg}>Salvar</Button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {/* === ABA 9: BACKUP === */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações do Backup</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Último Backup</p>
                    <p className="text-sm text-gray-200 font-medium">{backup.ultimoBackup}</p>
                  </div>
                  <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Tamanho</p>
                    <p className="text-sm text-gray-200 font-medium">{backup.tamanho}</p>
                  </div>
                  <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Frequência</p>
                    <p className="text-sm text-gray-200 font-medium capitalize">{backup.frequencia}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Frequência de Backup</h2>
                <div className="flex gap-3">
                  {(['manual', 'diario', 'semanal', 'mensal'] as const).map(freq => (
                    <button key={freq} onClick={() => setBackup(p => ({ ...p, frequencia: freq }))}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                        backup.frequencia === freq ? 'border-accent bg-accent/10 text-accent' : 'border-dark-600 text-gray-400'
                      }`}>
                      {freq === 'manual' ? 'Manual' : freq === 'diario' ? 'Diário' : freq === 'semanal' ? 'Semanal' : 'Mensal'}
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Ações</h2>
                <div className="flex gap-3">
                  <Button onClick={handleBackup}><Download size={16} className="mr-2" />Fazer Backup Agora</Button>
                  <Button variant="secondary"><Eye size={16} className="mr-2" />Ver Histórico</Button>
                </div>
              </Card>
            </div>
          )}

          {/* === ABA 10: DASHBOARD === */}
          {activeTab === 'dashboard' && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Widgets do Dashboard</h2>
              <p className="text-xs text-gray-500 mb-4">Ative ou desative os indicadores que deseja visualizar no dashboard.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {widgets.map(w => (
                  <div key={w.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer ${w.ativo ? 'border-accent/30 bg-accent/5' : 'border-dark-600 bg-dark-800/50'}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleWidget(w.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${w.ativo ? 'border-accent bg-accent' : 'border-dark-500'}`}>
                        {w.ativo && <Check size={12} className="text-white" />}
                      </button>
                      <span className={`text-sm ${w.ativo ? 'text-gray-200' : 'text-gray-500'}`}>{w.label}</span>
                    </div>
                    <ToggleLeft size={18} className={w.ativo ? 'text-accent' : 'text-gray-600'} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* === ABA 11: ASSINATURA === */}
          {activeTab === 'licenca' && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Assinatura e Licença</h2>
                  <BadgeStatus label={licenca.status === 'ativa' ? 'Ativa' : 'Expirada'} variant={licenca.status === 'ativa' ? 'success' : 'danger'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Plano</p>
                    <p className="text-sm text-gray-200 font-medium">{licenca.plano}</p>
                  </div>
                  <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Vencimento</p>
                    <p className="text-sm text-gray-200 font-medium">{licenca.dataVencimento}</p>
                  </div>
                  <div className="bg-dark-700/50 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">Dias Restantes</p>
                    <p className="text-sm text-green-400 font-medium">
                      {Math.max(0, Math.ceil((new Date(licenca.dataVencimento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias
                    </p>
                  </div>
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Histórico de Pagamentos</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-dark-600">
                        <th className="text-left py-3 px-2">Data</th>
                        <th className="text-right py-3 px-2">Valor</th>
                        <th className="text-center py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenca.historicoPagamentos.map((p, i) => (
                        <tr key={i} className="border-b border-dark-700">
                          <td className="py-3 px-2 text-gray-400">{p.data}</td>
                          <td className="py-3 px-2 text-right text-gray-200">{formatCurrency(p.valor)}</td>
                          <td className="py-3 px-2 text-center"><BadgeStatus label={p.status === 'pago' ? 'Pago' : 'Pendente'} variant={p.status === 'pago' ? 'success' : 'warning'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Renovação</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Plano atual: <span className="text-accent font-medium">{licenca.plano}</span></p>
                    <p className="text-xs text-gray-500 mt-1">Renove seu plano para continuar utilizando todos os recursos do sistema.</p>
                  </div>
                  <Button>Renovar Agora</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
