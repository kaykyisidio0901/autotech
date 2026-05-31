import type { OrdemServico } from '../types'
import { api } from './api'

export async function listarOrdensServico(): Promise<OrdemServico[]> {
  return api.get<OrdemServico[]>('/ordens-servico')
}

export async function buscarOrdemServico(id: number): Promise<OrdemServico | undefined> {
  return api.get<OrdemServico>(`/ordens-servico/${id}`)
}

export async function salvarOrdemServico(data: Omit<OrdemServico, 'id'>): Promise<OrdemServico> {
  return api.post<OrdemServico>('/ordens-servico', data)
}

export async function atualizarOrdemServico(id: number, data: Partial<OrdemServico>): Promise<OrdemServico> {
  return api.put<OrdemServico>(`/ordens-servico/${id}`, data)
}
