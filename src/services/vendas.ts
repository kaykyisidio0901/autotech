import type { Venda } from '../types'
import { api } from './api'

export async function fetchVendas(): Promise<Venda[]> {
  return api.get<Venda[]>('/vendas')
}

export async function createVenda(data: Omit<Venda, 'id'>): Promise<Venda> {
  return api.post<Venda>('/vendas', data)
}

export async function cancelVenda(id: number): Promise<void> {
  await api.patch(`/vendas/${id}/cancelar`)
}
