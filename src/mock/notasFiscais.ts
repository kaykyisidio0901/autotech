import type { NotaFiscal, Compra } from '../types'

export const mockNotasFiscais: NotaFiscal[] = [
  {
    id: 1, numero: 'NF-000001', fornecedor: 'Pioneer', cnpj: '12.345.678/0001-90',
    dataEmissao: '2026-05-15', valorTotal: 15000, parcelas: 3,
    produtos: [
      { codigo: 'PIO-001', nome: 'Central Multimídia Pioneer', quantidade: 5, valorUnitario: 2200, valorTotal: 11000 },
      { codigo: 'PIO-002', nome: 'Alarme Automotivo', quantidade: 10, valorUnitario: 350, valorTotal: 3500 },
      { codigo: 'PIO-003', nome: 'Subwoofer 12"', quantidade: 2, valorUnitario: 780, valorTotal: 1560 },
    ],
  },
  {
    id: 2, numero: 'NF-000002', fornecedor: 'JBL', cnpj: '23.456.789/0001-01',
    dataEmissao: '2026-05-18', valorTotal: 8000, parcelas: 2,
    produtos: [
      { codigo: 'JBL-001', nome: 'Caixa Acústica 6" 300W', quantidade: 20, valorUnitario: 320, valorTotal: 6400 },
      { codigo: 'JBL-002', nome: 'Caixa Acústica 8" 400W', quantidade: 5, valorUnitario: 450, valorTotal: 2250 },
    ],
  },
  {
    id: 3, numero: 'NF-000003', fornecedor: 'Multilaser', cnpj: '34.567.890/0001-12',
    dataEmissao: '2026-05-20', valorTotal: 3500, parcelas: 1,
    produtos: [
      { codigo: 'ML-001', nome: 'Lâmpada LED T10', quantidade: 100, valorUnitario: 35, valorTotal: 3500 },
    ],
  },
  {
    id: 4, numero: 'NF-000004', fornecedor: 'Stetsom', cnpj: '67.890.123/0001-45',
    dataEmissao: '2026-05-22', valorTotal: 5250, parcelas: 3,
    produtos: [
      { codigo: 'ST-001', nome: 'Amplificador 400W 4 Canais', quantidade: 5, valorUnitario: 1100, valorTotal: 5500 },
      { codigo: 'ST-002', nome: 'Módulo de Som Digital', quantidade: 3, valorUnitario: 950, valorTotal: 2850 },
    ],
  },
]

export const mockCompras: Compra[] = [
  { id: 1, numeroNfe: 'NF-000001', fornecedor: 'Pioneer', data: '2026-05-15', valor: 15000, quantidadeProdutos: 17 },
  { id: 2, numeroNfe: 'NF-000002', fornecedor: 'JBL', data: '2026-05-18', valor: 8000, quantidadeProdutos: 25 },
  { id: 3, numeroNfe: 'NF-000003', fornecedor: 'Multilaser', data: '2026-05-20', valor: 3500, quantidadeProdutos: 100 },
  { id: 4, numeroNfe: 'NF-000004', fornecedor: 'Stetsom', data: '2026-05-22', valor: 5250, quantidadeProdutos: 8 },
]
