import type { ContaReceber, ContaPagar } from '../types'

export const mockContasReceber: ContaReceber[] = [
  { id: 1, cliente: 'Fernando Lima', descricao: 'Venda #0042', valor: 1530, vencimento: '2026-06-05', status: 'pendente' },
  { id: 2, cliente: 'Juliana Costa', descricao: 'Venda #0041', valor: 450, vencimento: '2026-05-29', status: 'pago' },
  { id: 3, cliente: 'Roberto Alves', descricao: 'Venda #0040', valor: 2670, vencimento: '2026-06-15', status: 'pendente' },
  { id: 4, cliente: 'Camila Rocha', descricao: 'Venda #0039', valor: 1940, vencimento: '2026-05-28', status: 'vencido' },
  { id: 5, cliente: 'Diego Martins', descricao: 'OS #005', valor: 900, vencimento: '2026-06-10', status: 'pendente' },
  { id: 6, cliente: 'Fernando Lima', descricao: 'OS #006', valor: 3140, vencimento: '2026-06-20', status: 'pendente' },
  { id: 7, cliente: 'Larissa Nunes', descricao: 'Venda #0048', valor: 3160, vencimento: '2026-06-01', status: 'vencido' },
  { id: 8, cliente: 'Eduardo Barbosa', descricao: 'Venda #0047', valor: 2200, vencimento: '2026-06-12', status: 'pendente' },
]

export const mockContasPagar: ContaPagar[] = [
  { id: 1, fornecedor: 'Pioneer', descricao: 'Compra Centrais Multimídia', valor: 15000, vencimento: '2026-06-10', status: 'pendente' },
  { id: 2, fornecedor: 'JBL', descricao: 'Compra Caixas Acústicas', valor: 8000, vencimento: '2026-05-25', status: 'pago' },
  { id: 3, fornecedor: 'Stetsom', descricao: 'Compra Amplificadores', valor: 5250, vencimento: '2026-06-05', status: 'pendente' },
  { id: 4, fornecedor: 'Multilaser', descricao: 'Compra Lâmpadas LED', valor: 3500, vencimento: '2026-05-20', status: 'vencido' },
  { id: 5, fornecedor: 'Dell Áudio', descricao: 'Compra Sensores', valor: 2400, vencimento: '2026-06-15', status: 'pendente' },
  { id: 6, fornecedor: 'Harman', descricao: 'Compra Centrais GPS', valor: 11200, vencimento: '2026-05-30', status: 'vencido' },
  { id: 7, fornecedor: 'Taramps', descricao: 'Compra Amplificadores Taramps', valor: 3900, vencimento: '2026-06-20', status: 'pendente' },
]
