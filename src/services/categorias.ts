import { mockCategorias } from '../mock/categorias'
import type { Categoria } from '../types'

const delay = () => new Promise((r) => setTimeout(r, 150))

export async function fetchCategorias(): Promise<Categoria[]> {
  await delay()
  return [...mockCategorias]
}

export async function createCategoria(data: Omit<Categoria, 'id'>): Promise<Categoria> {
  await delay()
  const nova = { ...data, id: Math.max(...mockCategorias.map((c) => c.id)) + 1 }
  mockCategorias.push(nova)
  return nova
}

export async function updateCategoria(id: number, data: Partial<Categoria>): Promise<Categoria> {
  await delay()
  const idx = mockCategorias.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Categoria não encontrada')
  mockCategorias[idx] = { ...mockCategorias[idx], ...data }
  return mockCategorias[idx]
}

export async function deleteCategoria(id: number): Promise<void> {
  await delay()
  const idx = mockCategorias.findIndex((c) => c.id === id)
  if (idx !== -1) mockCategorias.splice(idx, 1)
}
