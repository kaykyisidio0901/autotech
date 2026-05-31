import type { NotaFiscal, Compra } from '../types'
import { api } from './api'

export async function listarNotasFiscais(): Promise<NotaFiscal[]> {
  return api.get<NotaFiscal[]>('/notas-fiscais')
}

export async function listarCompras(): Promise<Compra[]> {
  return api.get<Compra[]>('/compras')
}

export async function importarXML(xmlContent: string): Promise<NotaFiscal> {
  return api.post<NotaFiscal>('/notas-fiscais', { xml: xmlContent })
}

export async function processarNota(notaId: number): Promise<{ estoqueAtualizado: number; contasGeradas: number }> {
  return api.post(`/notas-fiscais/${notaId}/processar`)
}
