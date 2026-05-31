import { mockProdutos } from '../mock/produtos'
import type { Produto } from '../types'

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

export async function fetchProdutos(): Promise<Produto[]> {
  await delay()
  return [...mockProdutos]
}

export async function fetchProduto(id: number): Promise<Produto | undefined> {
  await delay()
  return mockProdutos.find((p) => p.id === id)
}

export async function createProduto(data: Omit<Produto, 'id'>): Promise<Produto> {
  await delay()
  const novo = { ...data, id: Math.max(...mockProdutos.map((p) => p.id)) + 1 }
  mockProdutos.push(novo)
  return novo
}

export async function updateProduto(id: number, data: Partial<Produto>): Promise<Produto> {
  await delay()
  const idx = mockProdutos.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Produto não encontrado')
  mockProdutos[idx] = { ...mockProdutos[idx], ...data }
  return mockProdutos[idx]
}

export async function deleteProduto(id: number): Promise<void> {
  await delay()
  const idx = mockProdutos.findIndex((p) => p.id === id)
  if (idx !== -1) mockProdutos.splice(idx, 1)
}
