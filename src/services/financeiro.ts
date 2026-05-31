import { mockContasReceber, mockContasPagar } from '../mock/financeiro'
import type { ContaReceber, ContaPagar } from '../types'

const delay = () => new Promise(r => setTimeout(r, 200))

export async function listarContasReceber(): Promise<ContaReceber[]> {
  await delay()
  return [...mockContasReceber]
}

export async function listarContasPagar(): Promise<ContaPagar[]> {
  await delay()
  return [...mockContasPagar]
}

export async function salvarContaReceber(data: Omit<ContaReceber, 'id'>): Promise<ContaReceber> {
  await delay()
  const id = Math.max(...mockContasReceber.map(c => c.id), 0) + 1
  const conta = { ...data, id }
  mockContasReceber.push(conta)
  return conta
}

export async function atualizarContaReceber(id: number, data: Partial<ContaReceber>): Promise<ContaReceber | undefined> {
  await delay()
  const idx = mockContasReceber.findIndex(c => c.id === id)
  if (idx === -1) return undefined
  mockContasReceber[idx] = { ...mockContasReceber[idx], ...data }
  return mockContasReceber[idx]
}

export async function salvarContaPagar(data: Omit<ContaPagar, 'id'>): Promise<ContaPagar> {
  await delay()
  const id = Math.max(...mockContasPagar.map(c => c.id), 0) + 1
  const conta = { ...data, id }
  mockContasPagar.push(conta)
  return conta
}

export async function atualizarContaPagar(id: number, data: Partial<ContaPagar>): Promise<ContaPagar | undefined> {
  await delay()
  const idx = mockContasPagar.findIndex(c => c.id === id)
  if (idx === -1) return undefined
  mockContasPagar[idx] = { ...mockContasPagar[idx], ...data }
  return mockContasPagar[idx]
}
