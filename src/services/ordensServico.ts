import { mockOrdensServico } from '../mock/ordensServico'
import type { OrdemServico } from '../types'

const delay = () => new Promise(r => setTimeout(r, 200))

export async function listarOrdensServico(): Promise<OrdemServico[]> {
  await delay()
  return [...mockOrdensServico]
}

export async function buscarOrdemServico(id: number): Promise<OrdemServico | undefined> {
  await delay()
  return mockOrdensServico.find(o => o.id === id)
}

export async function salvarOrdemServico(data: Omit<OrdemServico, 'id'>): Promise<OrdemServico> {
  await delay()
  const id = Math.max(...mockOrdensServico.map(o => o.id), 0) + 1
  const os = { ...data, id }
  mockOrdensServico.push(os)
  return os
}

export async function atualizarOrdemServico(id: number, data: Partial<OrdemServico>): Promise<OrdemServico | undefined> {
  await delay()
  const idx = mockOrdensServico.findIndex(o => o.id === id)
  if (idx === -1) return undefined
  mockOrdensServico[idx] = { ...mockOrdensServico[idx], ...data }
  return mockOrdensServico[idx]
}
