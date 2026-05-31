import type { Fornecedor } from '../types'
import { api } from './api'

export async function fetchFornecedores(): Promise<Fornecedor[]> {
  return api.get<Fornecedor[]>('/fornecedores')
}

export async function createFornecedor(data: Omit<Fornecedor, 'id'>): Promise<Fornecedor> {
  return api.post<Fornecedor>('/fornecedores', data)
}

export async function updateFornecedor(id: number, data: Partial<Fornecedor>): Promise<Fornecedor> {
  return api.put<Fornecedor>(`/fornecedores/${id}`, data)
}

export async function deleteFornecedor(id: number): Promise<void> {
  await api.delete(`/fornecedores/${id}`)
}
