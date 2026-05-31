import type { Cliente, Veiculo } from '../types'
import { api } from './api'

export async function listarClientes(): Promise<Cliente[]> {
  return api.get<Cliente[]>('/clientes')
}

export async function buscarCliente(id: number): Promise<Cliente | undefined> {
  return api.get<Cliente>(`/clientes/${id}`)
}

export async function buscarClientePorNome(nome: string): Promise<Cliente[]> {
  const todos = await listarClientes()
  return todos.filter(c => c.nome.toLowerCase().includes(nome.toLowerCase()))
}

export async function salvarCliente(data: Omit<Cliente, 'id'>): Promise<Cliente> {
  return api.post<Cliente>('/clientes', data)
}

export async function atualizarCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
  return api.put<Cliente>(`/clientes/${id}`, data)
}

export async function excluirCliente(id: number): Promise<void> {
  await api.delete(`/clientes/${id}`)
}

export async function listarVeiculos(clienteId: number): Promise<Veiculo[]> {
  return api.get<Veiculo[]>(`/clientes/${clienteId}/veiculos`)
}

export async function salvarVeiculo(data: Omit<Veiculo, 'id'>): Promise<Veiculo> {
  return api.post<Veiculo>('/veiculos', data)
}

export async function consultarPlaca(placa: string): Promise<Partial<Veiculo> | null> {
  try {
    return await api.get<Partial<Veiculo>>(`/veiculos/consulta-placa/${placa}`)
  } catch {
    return null
  }
}
