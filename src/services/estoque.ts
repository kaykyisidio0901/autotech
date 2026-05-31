import type { MovimentacaoEstoque } from '../types'
import { api } from './api'

export async function fetchMovimentacoes(): Promise<MovimentacaoEstoque[]> {
  return api.get<MovimentacaoEstoque[]>('/estoque/movimentacoes')
}

export async function createMovimentacao(data: Omit<MovimentacaoEstoque, 'id'>): Promise<MovimentacaoEstoque> {
  return api.post<MovimentacaoEstoque>('/estoque/movimentacoes', data)
}

export async function getIndicadores(): Promise<{ total: number; semEstoque: number; estoqueBaixo: number; valorTotal: number }> {
  return api.get('/estoque/indicadores')
}
