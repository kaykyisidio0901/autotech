import type { ContaReceber, ContaPagar } from '../types'
import { api } from './api'

export async function listarContasReceber(): Promise<ContaReceber[]> {
  return api.get<ContaReceber[]>('/financeiro/contas-receber')
}

export async function listarContasPagar(): Promise<ContaPagar[]> {
  return api.get<ContaPagar[]>('/financeiro/contas-pagar')
}

export async function salvarContaReceber(data: Omit<ContaReceber, 'id'>): Promise<ContaReceber> {
  return api.post<ContaReceber>('/financeiro/contas-receber', data)
}

export async function atualizarContaReceber(id: number, data: Partial<ContaReceber>): Promise<ContaReceber> {
  return api.put<ContaReceber>(`/financeiro/contas-receber/${id}`, data)
}

export async function salvarContaPagar(data: Omit<ContaPagar, 'id'>): Promise<ContaPagar> {
  return api.post<ContaPagar>('/financeiro/contas-pagar', data)
}

export async function atualizarContaPagar(id: number, data: Partial<ContaPagar>): Promise<ContaPagar> {
  return api.put<ContaPagar>(`/financeiro/contas-pagar/${id}`, data)
}
