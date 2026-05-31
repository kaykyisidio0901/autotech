import type { Categoria } from '../types'
import { api } from './api'

export async function fetchCategorias(): Promise<Categoria[]> {
  return api.get<Categoria[]>('/categorias')
}

export async function createCategoria(data: Omit<Categoria, 'id'>): Promise<Categoria> {
  return api.post<Categoria>('/categorias', data)
}

export async function updateCategoria(id: number, data: Partial<Categoria>): Promise<Categoria> {
  return api.put<Categoria>(`/categorias/${id}`, data)
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
