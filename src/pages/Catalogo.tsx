import { useState, useMemo, useEffect } from 'react'
import { fetchProdutos } from '../services/produtos'
import { fetchCategorias } from '../services/categorias'
import type { Produto, Categoria } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import { getProdutoImage, getProdutoGallery } from '../utils/produtoImagem'
import { Search, Share2, Printer, Eye, SlidersHorizontal } from 'lucide-react'

export function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('todas')
  const [marcaFilter, setMarcaFilter] = useState('todas')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [selectedProd, setSelectedProd] = useState<Produto | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          fetchProdutos(),
          fetchCategorias(),
        ])
        setProdutos(prods)
        setCategorias(cats)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const marcas = useMemo(() => [...new Set(produtos.map(p => p.marca))].sort(), [produtos])

  const filtered = useMemo(() => {
    return produtos.filter(p => {
      if (!p.status) return false
      if (search && !p.nome.toLowerCase().includes(search.toLowerCase()) && !p.marca.toLowerCase().includes(search.toLowerCase())) return false
      if (catFilter !== 'todas' && p.categoria !== catFilter) return false
      if (marcaFilter !== 'todas' && p.marca !== marcaFilter) return false
      if (p.precoVenda < priceRange[0] || p.precoVenda > priceRange[1]) return false
      return true
    })
  }, [produtos, search, catFilter, marcaFilter, priceRange])

  function compartilhar(prod: Produto) {
    const text = `Confira ${prod.nome} - ${formatCurrency(prod.precoVenda)} na AutoTech!`
    if (navigator.share) {
      navigator.share({ title: prod.nome, text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  function imprimirFicha(prod: Produto) {
    const win = window.open('', '_blank', 'width=500,height=700')
    if (!win) return
    win.document.write(`
      <html><head><title>${prod.nome}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}img{max-width:300px;border-radius:8px}h1{font-size:20px}.info{margin-top:20px;line-height:2}.price{font-size:24px;color:#10b981;font-weight:bold}</style>
      </head><body>
      <img src="${getProdutoImage(prod.id)}" />
      <h1>${prod.nome}</h1>
      <div class="info">
        <p><strong>Marca:</strong> ${prod.marca}</p>
        <p><strong>Categoria:</strong> ${prod.categoria}</p>
        <p><strong>Código:</strong> ${prod.codigoInterno}</p>
        <p><strong>Descrição:</strong> ${prod.descricao || '—'}</p>
      </div>
      <p class="price">${formatCurrency(prod.precoVenda)}</p>
      </body></html>
    `)
    win.document.close()
    win.print()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Catálogo Digital</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} produto(s) disponível(is)</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} className="mr-2" />Filtros
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent"
            placeholder="Buscar por nome ou marca..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {showFilters && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Categoria</label>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                <option value="todas">Todas</option>
                {categorias.filter(c => c.ativo).map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Marca</label>
              <select value={marcaFilter} onChange={e => setMarcaFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 text-sm outline-none focus:border-accent">
                <option value="todas">Todas</option>
                {marcas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Preço até R$ {priceRange[1]}</label>
              <input type="range" min={0} max={10000} step={100} value={priceRange[1]}
                onChange={e => setPriceRange([0, Number(e.target.value)])}
                className="w-full accent-accent" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>R$ 0</span>
                <span>R$ 10.000</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(prod => (
          <div key={prod.id} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden hover:border-accent/40 transition-all group">
            <div className="aspect-square bg-dark-900 overflow-hidden relative cursor-pointer" onClick={() => { setSelectedProd(prod); setCurrentImg(0) }}>
              <img src={getProdutoImage(prod.id)} alt={prod.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); compartilhar(prod) }} className="w-7 h-7 bg-dark-900/80 rounded-full flex items-center justify-center text-gray-400 hover:text-accent cursor-pointer"><Share2 size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); imprimirFicha(prod) }} className="w-7 h-7 bg-dark-900/80 rounded-full flex items-center justify-center text-gray-400 hover:text-accent cursor-pointer"><Printer size={14} /></button>
              </div>
              <div className="absolute bottom-2 left-2">
                <BadgeStatus label={prod.quantidade === 0 ? 'Indisponível' : 'Disponível'} variant={prod.quantidade === 0 ? 'danger' : 'success'} />
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500">{prod.marca}</p>
              <p className="text-sm font-medium text-gray-200 truncate mt-0.5">{prod.nome}</p>
              <p className="text-xs text-gray-600 mt-0.5">{prod.categoria}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-bold text-accent">{formatCurrency(prod.precoVenda)}</span>
                <span className="text-xs text-gray-600">{prod.quantidade} em estoque</span>
              </div>
              <Button fullWidth variant="secondary" className="mt-2 !py-1.5 !text-xs" onClick={() => { setSelectedProd(prod); setCurrentImg(0) }}>
                <Eye size={14} className="mr-1" />Visualizar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={selectedProd !== null} onClose={() => setSelectedProd(null)} title={selectedProd?.nome || ''} size="lg">
        {selectedProd && (
          <div className="space-y-4">
            <div className="flex gap-6">
              <div className="shrink-0">
                <img src={getProdutoGallery(selectedProd.id)[currentImg]} alt={selectedProd.nome}
                  className="w-56 h-56 rounded-xl object-cover bg-dark-900" />
                <div className="flex gap-2 mt-2">
                  {getProdutoGallery(selectedProd.id).map((url, i) => (
                    <button key={i} onClick={() => setCurrentImg(i)}
                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${currentImg === i ? 'border-accent' : 'border-transparent'} cursor-pointer`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <BadgeStatus label={selectedProd.marca} variant="info" />
                  <BadgeStatus label={selectedProd.categoria} variant="muted" />
                </div>
                <p className="text-2xl font-bold text-accent">{formatCurrency(selectedProd.precoVenda)}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Código:</span> <span className="text-gray-300 ml-1">{selectedProd.codigoInterno}</span></div>
                  <div><span className="text-gray-500">Estoque:</span> <span className="text-gray-300 ml-1">{selectedProd.quantidade} un</span></div>
                  <div><span className="text-gray-500">Marca:</span> <span className="text-gray-300 ml-1">{selectedProd.marca}</span></div>
                  <div><span className="text-gray-500">Fornecedor:</span> <span className="text-gray-300 ml-1">{selectedProd.fornecedor}</span></div>
                </div>
                {selectedProd.descricao && (
                  <div><span className="text-xs text-gray-500">Descrição:</span><p className="text-sm text-gray-400 mt-1">{selectedProd.descricao}</p></div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => compartilhar(selectedProd)}><Share2 size={16} className="mr-2" />Compartilhar</Button>
                  <Button variant="secondary" onClick={() => imprimirFicha(selectedProd)}><Printer size={16} className="mr-2" />Imprimir</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
