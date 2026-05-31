import { mockMovimentacoes } from '../mock/movimentacoes'
import { mockProdutos } from '../mock/produtos'
import type { MovimentacaoEstoque } from '../types'

const delay = () => new Promise((r) => setTimeout(r, 150))

export async function fetchMovimentacoes(): Promise<MovimentacaoEstoque[]> {
  await delay()
  return [...mockMovimentacoes].reverse()
}

export async function createMovimentacao(data: Omit<MovimentacaoEstoque, 'id'>): Promise<MovimentacaoEstoque> {
  await delay()
  const nova = { ...data, id: Math.max(...mockMovimentacoes.map((m) => m.id), 0) + 1 }
  mockMovimentacoes.push(nova)

  const prod = mockProdutos.find((p) => p.id === data.produtoId)
  if (prod) {
    if (data.tipo === 'entrada') prod.quantidade += data.quantidade
    else if (data.tipo === 'saida') prod.quantidade = Math.max(0, prod.quantidade - data.quantidade)
    else prod.quantidade = Math.max(0, prod.quantidade + data.quantidade)
  }

  return nova
}

export function getIndicadores() {
  const total = mockProdutos.length
  const semEstoque = mockProdutos.filter((p) => p.quantidade === 0).length
  const estoqueBaixo = mockProdutos.filter((p) => p.quantidade > 0 && p.quantidade <= p.estoqueMinimo).length
  const valorTotal = mockProdutos.reduce((acc, p) => acc + p.quantidade * p.precoCusto, 0)
  return { total, semEstoque, estoqueBaixo, valorTotal }
}
