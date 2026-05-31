import type { Produto } from '../types'
import { api } from './api'

export async function fetchProdutos(): Promise<Produto[]> {
  return api.get<Produto[]>('/produtos')
}

export async function fetchProduto(id: number): Promise<Produto | undefined> {
  return api.get<Produto>(`/produtos/${id}`)
}

export async function createProduto(data: Omit<Produto, 'id'>): Promise<Produto> {
  return api.post<Produto>('/produtos', data)
}

export async function updateProduto(id: number, data: Partial<Produto>): Promise<Produto> {
  return api.put<Produto>(`/produtos/${id}`, data)
}

export async function deleteProduto(id: number): Promise<void> {
  await api.delete(`/produtos/${id}`)
}
