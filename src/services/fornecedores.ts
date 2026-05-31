import { mockFornecedores } from '../mock/fornecedores'
import type { Fornecedor } from '../types'

const delay = () => new Promise((r) => setTimeout(r, 150))

export async function fetchFornecedores(): Promise<Fornecedor[]> {
  await delay()
  return [...mockFornecedores]
}

export async function createFornecedor(data: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  await delay()
  const novo = { ...data, id: Math.max(...mockFornecedores.map((f) => f.id)) + 1 }
  mockFornecedores.push(novo)
  return novo
}

export async function updateFornecedor(id: number, data: Partial<Fornecedor>): Promise<Fornecedor> {
  await delay()
  const idx = mockFornecedores.findIndex((f) => f.id === id)
  if (idx === -1) throw new Error('Fornecedor não encontrado')
  mockFornecedores[idx] = { ...mockFornecedores[idx], ...data }
  return mockFornecedores[idx]
}

export async function deleteFornecedor(id: number): Promise<void> {
  await delay()
  const idx = mockFornecedores.findIndex((f) => f.id === id)
  if (idx !== -1) mockFornecedores.splice(idx, 1)
}
