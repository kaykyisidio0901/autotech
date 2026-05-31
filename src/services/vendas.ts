import { mockVendas } from '../mock/vendas'
import type { Venda } from '../types'

const delay = () => new Promise((r) => setTimeout(r, 150))

export async function fetchVendas(): Promise<Venda[]> {
  await delay()
  return [...mockVendas].reverse()
}

export async function createVenda(data: Omit<Venda, 'id'>): Promise<Venda> {
  await delay()
  const nova = { ...data, id: Math.max(...mockVendas.map((v) => v.id), 0) + 1 }
  mockVendas.push(nova)
  return nova
}

export async function cancelVenda(id: number): Promise<void> {
  await delay()
  const venda = mockVendas.find((v) => v.id === id)
  if (venda) venda.status = 'cancelada'
}
