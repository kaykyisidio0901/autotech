import { mockClientes, mockVeiculos } from '../mock/clientes'
import type { Cliente, Veiculo } from '../types'

const delay = () => new Promise(r => setTimeout(r, 200))

export async function listarClientes(): Promise<Cliente[]> {
  await delay()
  return [...mockClientes]
}

export async function buscarCliente(id: number): Promise<Cliente | undefined> {
  await delay()
  return mockClientes.find(c => c.id === id)
}

export async function buscarClientePorNome(nome: string): Promise<Cliente[]> {
  await delay()
  return mockClientes.filter(c => c.nome.toLowerCase().includes(nome.toLowerCase()))
}

export async function salvarCliente(data: Omit<Cliente, 'id'>): Promise<Cliente> {
  await delay()
  const id = Math.max(...mockClientes.map(c => c.id), 0) + 1
  const cliente = { ...data, id }
  mockClientes.push(cliente)
  return cliente
}

export async function atualizarCliente(id: number, data: Partial<Cliente>): Promise<Cliente | undefined> {
  await delay()
  const idx = mockClientes.findIndex(c => c.id === id)
  if (idx === -1) return undefined
  mockClientes[idx] = { ...mockClientes[idx], ...data }
  return mockClientes[idx]
}

export async function excluirCliente(id: number): Promise<boolean> {
  await delay()
  const idx = mockClientes.findIndex(c => c.id === id)
  if (idx === -1) return false
  mockClientes.splice(idx, 1)
  return true
}

export async function listarVeiculos(clienteId: number): Promise<Veiculo[]> {
  await delay()
  return mockVeiculos.filter(v => v.clienteId === clienteId)
}

export async function salvarVeiculo(data: Omit<Veiculo, 'id'>): Promise<Veiculo> {
  await delay()
  const id = Math.max(...mockVeiculos.map(v => v.id), 0) + 1
  const veiculo = { ...data, id }
  mockVeiculos.push(veiculo)
  return veiculo
}

export async function consultarPlaca(placa: string): Promise<Partial<Veiculo> | null> {
  await new Promise(r => setTimeout(r, 500))
  const existente = mockVeiculos.find(v => v.placa === placa)
  if (existente) return { ...existente }

  // simulate plate lookup
  if (placa && placa.length >= 7) {
    return {
      placa: placa.toUpperCase(),
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: 2020,
      cor: 'Preto',
      chassi: '9BWZZZ377VT999999',
      combustivel: 'Flex',
    }
  }
  return null
}
