import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { fetchProdutos, createProduto, updateProduto, deleteProduto } from '../services/produtos'
import { fetchCategorias } from '../services/categorias'
import { fetchFornecedores } from '../services/fornecedores'
import type { Produto, Categoria, Fornecedor } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { Pagination } from '../components/ui/Pagination'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import { getProdutoImage, getProdutoGallery } from '../utils/produtoImagem'
import { useAuthStore } from '../stores/authStore'
import { Upload, LayoutGrid, List, Camera } from 'lucide-react'

const emptyForm: Omit<Produto, 'id'> = {
  codigoInterno: '', codigoBarras: '', nome: '', categoria: '', marca: '',
  fornecedor: '', descricao: '', precoCusto: 0, precoVenda: 0,
  quantidade: 0, estoqueMinimo: 0, status: true,
}

type SortKey = 'codigoInterno' | 'nome' | 'categoria' | 'quantidade' | 'precoVenda' | 'status'
type ViewMode = 'table' | 'grid'

export function Produtos() {
  const user = useAuthStore((s) => s.user)
  const canEdit = user?.role === 'admin' || user?.role === 'proprietario' || user?.role === 'gerente'
  console.log('🔍 [Produtos] user:', user, '| canEdit:', canEdit)
  const roleBadge = user ? { admin: '🟢 Proprietário', proprietario: '🟢 Proprietário', gerente: '🔵 Gerente', funcionario: '⚪ Funcionário' }[user.role] || '⚪ Desconhecido' : '🔴 Não logado'
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('todas')
  const [sortKey, setSortKey] = useState<SortKey>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [duplicating, setDuplicating] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [previewProd, setPreviewProd] = useState<Produto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pageSize = 10

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats, fors] = await Promise.all([
          fetchProdutos(),
          fetchCategorias(),
          fetchFornecedores(),
        ])
        setProdutos(prods)
        setCategorias(cats)
        setFornecedores(fors)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let list = produtos.filter((p) => {
      const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.codigoInterno.toLowerCase().includes(search.toLowerCase()) || p.codigoBarras.includes(search)
      const matchCat = catFilter === 'todas' || p.categoria === catFilter
      return matchSearch && matchCat
    })
    list.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [produtos, search, catFilter, sortKey, sortDir])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  function openNew() {
    setEditing(null); setForm(emptyForm); setDuplicating(false); setModalOpen(true)
  }

  function openEdit(prod: Produto) {
    setEditing(prod); setForm(prod); setDuplicating(false); setModalOpen(true)
  }

  function openDuplicate(prod: Produto) {
    setEditing(null)
    setForm({ ...prod, codigoInterno: '', codigoBarras: '' })
    setDuplicating(true)
    setModalOpen(true)
  }

  const [saveError, setSaveError] = useState('')

  const handleSave = useCallback(async () => {
    if (!form.nome.trim()) return
    setSaveError('')
    try {
      const payload = { ...form, codigoInterno: form.codigoInterno || `PROD-${Date.now()}` }
      if (editing) {
        const updated = await updateProduto(editing.id, payload as any)
        setProdutos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createProduto(payload as any)
        setProdutos((prev) => [...prev, created])
      }
      setModalOpen(false)
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar produto')
    }
  }, [form, editing])

  const handleDelete = useCallback(async (id: number) => {
    await deleteProduto(id)
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }, [])

  function handleImageUrl() {
    const url = imageUrlInput.trim()
    if (!url) return
    setSelectedImage(url)
    setForm(p => ({ ...p, imagem: url }))
    setImageUrlInput('')
  }

  function handleManualUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setSelectedImage(url)
      setForm(p => ({ ...p, imagem: url }))
    }
    reader.readAsDataURL(file)
  }

  const sortIndicator = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Catálogo de produtos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-accent text-white' : 'text-gray-500 hover:text-gray-300'} cursor-pointer`}><List size={16} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-gray-500 hover:text-gray-300'} cursor-pointer`}><LayoutGrid size={16} /></button>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-300 font-mono">{roleBadge}</span>
          {canEdit && <Button onClick={openNew}>+ Novo Produto</Button>}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por nome, código interno ou código de barras..."
            className="w-full px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all"
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
        >
          <option value="todas">Todas as categorias</option>
          {categorias.filter((c) => c.ativo).map((c) => (
            <option key={c.id} value={c.nome}>{c.nome}</option>
          ))}
        </select>
      </div>

      {viewMode === 'table' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left text-gray-500 font-medium px-3 py-3">Foto</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3 cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort('codigoInterno')}>Código{sortIndicator('codigoInterno')}</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3 cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort('nome')}>Nome{sortIndicator('nome')}</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3 cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort('categoria')}>Categoria{sortIndicator('categoria')}</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3 cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort('quantidade')}>Estoque{sortIndicator('quantidade')}</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3 cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort('precoVenda')}>Venda{sortIndicator('precoVenda')}</th>
                  <th className="text-left text-gray-500 font-medium px-3 py-3 cursor-pointer hover:text-gray-300 select-none" onClick={() => handleSort('status')}>Status{sortIndicator('status')}</th>
                  <th className="text-right text-gray-500 font-medium px-3 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((prod) => (
                  <tr key={prod.id} className="border-b border-dark-600 last:border-0 hover:bg-dark-700/50 transition-colors cursor-pointer" onClick={() => setPreviewProd(prod)}>
                    <td className="px-3 py-2">
                      <img src={prod.imagem || getProdutoImage(prod.id)} alt={prod.nome} className="w-10 h-10 rounded-lg object-cover" loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).src = getProdutoImage(prod.id) }} />
                    </td>
                    <td className="px-3 py-3 text-gray-500 font-mono text-xs">{prod.codigoInterno}</td>
                    <td className="px-3 py-3 text-gray-200 font-medium max-w-[200px] truncate">{prod.nome}</td>
                    <td className="px-3 py-3 text-gray-400">{prod.categoria}</td>
                    <td className="px-3 py-3">
                      <span className={`font-medium ${prod.quantidade === 0 ? 'text-red-400' : prod.quantidade <= prod.estoqueMinimo ? 'text-yellow-400' : 'text-gray-200'}`}>
                        {prod.quantidade}
                      </span>
                      <span className="text-gray-600 text-xs ml-1">/ min {prod.estoqueMinimo}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-200 font-medium">{formatCurrency(prod.precoVenda)}</td>
                    <td className="px-3 py-3"><BadgeStatus label={prod.status ? 'Ativo' : 'Inativo'} variant={prod.status ? 'success' : 'muted'} /></td>
                    <td className="px-3 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openEdit(prod)}>Editar</Button>
                        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => openDuplicate(prod)}>Duplicar</Button>
                        {canEdit && (
                          <Button variant="ghost" className="!px-2 !py-1 text-xs text-red-400" onClick={() => setConfirmDelete(prod.id)}>Excluir</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paged.map(prod => (
            <div key={prod.id} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden hover:border-accent/30 transition-all group cursor-pointer" onClick={() => setPreviewProd(prod)}>
              <div className="aspect-square bg-dark-900 flex items-center justify-center overflow-hidden">
                <img src={prod.imagem || getProdutoImage(prod.id)} alt={prod.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.target as HTMLImageElement).src = getProdutoImage(prod.id) }} />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-200 truncate">{prod.nome}</p>
                <p className="text-xs text-gray-500 mt-1">{prod.marca} — {prod.categoria}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-accent">{formatCurrency(prod.precoVenda)}</span>
                  <span className={`text-xs ${prod.quantidade === 0 ? 'text-red-400' : prod.quantidade <= prod.estoqueMinimo ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {prod.quantidade} un
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Produto' : duplicating ? 'Duplicar Produto' : 'Novo Produto'} size="xl">
        <div className="space-y-4">
          <div className="flex gap-6">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-dark-900 border border-dark-600 rounded-xl flex items-center justify-center overflow-hidden relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {selectedImage || form.imagem ? (
                  <img src={selectedImage || form.imagem || ''} alt="Preview" className="w-full h-full object-cover"
                    onError={e => { const t = e.target as HTMLImageElement; t.style.display = 'none'; t.nextElementSibling?.classList.remove('hidden') }} />
                ) : null}
                <div className={`text-center ${selectedImage || form.imagem ? 'hidden' : ''}`}>
                  <Camera size={28} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-600">Foto</p>
                </div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleManualUpload} />
              <div className="flex items-center gap-2 mt-2">
                <input type="text" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)}
                  placeholder="URL da imagem..."
                  className="flex-1 px-2 py-1.5 rounded bg-dark-800 border border-dark-600 text-gray-100 text-xs outline-none focus:border-accent"
                  onKeyDown={e => e.key === 'Enter' && handleImageUrl()} />
                <button onClick={handleImageUrl} className="text-xs text-accent hover:text-accent-hover py-1 px-2 cursor-pointer whitespace-nowrap">OK</button>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input label="Código Interno" value={form.codigoInterno} onChange={(e) => setForm({ ...form, codigoInterno: e.target.value })} />
                <Input label="Código de Barras" value={form.codigoBarras} onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })} />
                <Input label="Marca" value={form.marca} onChange={(e) => { setForm({ ...form, marca: e.target.value }) }} placeholder="Ex: Pioneer" />
              </div>
              <Input label="Nome do Produto" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Pioneer TS-6960BR" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Categoria</label>
              <select className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecione...</option>
                {categorias.filter((c) => c.ativo).map((c) => (<option key={c.id} value={c.nome}>{c.nome}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Fornecedor</label>
              <select className="px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}>
                <option value="">Selecione...</option>
                {fornecedores.filter((f) => f.ativo).map((f) => (<option key={f.id} value={f.nomeFantasia}>{f.nomeFantasia}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Descrição</label>
            <textarea className="w-full px-3 py-2.5 rounded-lg bg-dark-900 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent transition-all resize-none" rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço de Custo (R$)" type="number" min={0} step={0.01} value={form.precoCusto || ''} onChange={(e) => setForm({ ...form, precoCusto: Number(e.target.value) })} />
            <Input label="Preço de Venda (R$)" type="number" min={0} step={0.01} value={form.precoVenda || ''} onChange={(e) => setForm({ ...form, precoVenda: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantidade em Estoque" type="number" min={0} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} />
            <Input label="Estoque Mínimo" type="number" min={0} value={form.estoqueMinimo} onChange={(e) => setForm({ ...form, estoqueMinimo: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-400">Status</label>
            <button
              type="button"
              onClick={() => setForm({ ...form, status: !form.status })}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.status ? 'bg-accent' : 'bg-dark-600'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.status ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-gray-300">{form.status ? 'Ativo' : 'Inativo'}</span>
          </div>
          {saveError && <p className="text-sm text-red-400">{saveError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.nome.trim()}>Salvar</Button>
          </div>
        </div>
      </Modal>

      <Modal open={previewProd !== null} onClose={() => setPreviewProd(null)} title={previewProd?.nome || ''} size="md">
        {previewProd && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <img src={previewProd.imagem || getProdutoImage(previewProd.id)} alt={previewProd.nome} className="w-40 h-40 rounded-xl object-cover bg-dark-900"
                onError={e => { (e.target as HTMLImageElement).src = getProdutoImage(previewProd.id) }} />
              <div className="flex-1 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-500">Código:</span> <span className="text-gray-200 ml-1">{previewProd.codigoInterno}</span></div>
                  <div><span className="text-gray-500">Barras:</span> <span className="text-gray-200 ml-1">{previewProd.codigoBarras}</span></div>
                  <div><span className="text-gray-500">Marca:</span> <span className="text-gray-200 ml-1">{previewProd.marca}</span></div>
                  <div><span className="text-gray-500">Categoria:</span> <span className="text-gray-200 ml-1">{previewProd.categoria}</span></div>
                  <div><span className="text-gray-500">Fornecedor:</span> <span className="text-gray-200 ml-1">{previewProd.fornecedor}</span></div>
                  <div><span className="text-gray-500">Estoque:</span> <span className={`ml-1 ${previewProd.quantidade === 0 ? 'text-red-400' : 'text-gray-200'}`}>{previewProd.quantidade}</span></div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="text-center"><span className="text-xs text-gray-500">Custo</span><p className="text-sm text-gray-300">{formatCurrency(previewProd.precoCusto)}</p></div>
                  <div className="text-center"><span className="text-xs text-gray-500">Venda</span><p className="text-sm text-accent font-semibold">{formatCurrency(previewProd.precoVenda)}</p></div>
                  <div className="text-center"><span className="text-xs text-gray-500">Margem</span><p className="text-sm text-green-400">{(((previewProd.precoVenda - previewProd.precoCusto) / previewProd.precoCusto) * 100).toFixed(0)}%</p></div>
                </div>
              </div>
            </div>
            {previewProd.descricao && (
              <div><span className="text-xs text-gray-500">Descrição:</span><p className="text-sm text-gray-400 mt-1">{previewProd.descricao}</p></div>
            )}
            <div className="flex gap-2">
              {getProdutoGallery(previewProd.id).slice(1).map((url, i) => (
                <img key={i} src={url} alt={`Galeria ${i + 1}`} className="w-16 h-16 rounded-lg object-cover bg-dark-900" />
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setPreviewProd(null)}>Fechar</Button>
              <Button onClick={() => { openEdit(previewProd); setPreviewProd(null) }}>Editar</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete) }} title="Excluir Produto" message="Tem certeza que deseja excluir este produto?" />
    </div>
  )
}
