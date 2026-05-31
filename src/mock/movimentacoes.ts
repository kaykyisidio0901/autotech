import type { MovimentacaoEstoque } from '../types'

export const mockMovimentacoes: MovimentacaoEstoque[] = [
  { id: 1, produtoId: 1, produtoNome: 'Central Multimídia Pioneer', tipo: 'entrada', quantidade: 10, data: '2026-05-20', observacao: 'Compra direta', responsavel: 'João Silva' },
  { id: 2, produtoId: 2, produtoNome: 'Módulo de Som MP3', tipo: 'entrada', quantidade: 5, data: '2026-05-21', observacao: 'Reposição de estoque', responsavel: 'Maria Souza' },
  { id: 3, produtoId: 4, produtoNome: 'Caixa Acústica 6" 300W', tipo: 'saida', quantidade: 3, data: '2026-05-22', observacao: 'Venda #0042', responsavel: 'João Silva' },
  { id: 4, produtoId: 7, produtoNome: 'Amplificador 400W 4 Canais', tipo: 'entrada', quantidade: 5, data: '2026-05-22', observacao: 'Compra Stetsom', responsavel: 'Ana Oliveira' },
  { id: 5, produtoId: 13, produtoNome: 'Farol de LED Branco', tipo: 'saida', quantidade: 1, data: '2026-05-23', observacao: 'Venda #0045', responsavel: 'Lucas Costa' },
  { id: 6, produtoId: 10, produtoNome: 'Câmera de Ré CCD', tipo: 'entrada', quantidade: 8, data: '2026-05-23', observacao: 'Reposição', responsavel: 'Maria Souza' },
  { id: 7, produtoId: 9, produtoNome: 'Kit Cabos RCA 5m', tipo: 'saida', quantidade: 10, data: '2026-05-24', observacao: 'Venda #0048', responsavel: 'João Silva' },
  { id: 8, produtoId: 6, produtoNome: 'Subwoofer 12" 600W', tipo: 'ajuste', quantidade: -2, data: '2026-05-24', observacao: 'Ajuste de inventário', responsavel: 'Carlos Alberto' },
  { id: 9, produtoId: 20, produtoNome: 'Alarme Automotivo', tipo: 'entrada', quantidade: 10, data: '2026-05-25', observacao: 'Compra Pioneer', responsavel: 'Ana Oliveira' },
  { id: 10, produtoId: 14, produtoNome: 'Lâmpada LED T10', tipo: 'saida', quantidade: 30, data: '2026-05-25', observacao: 'Venda #0050', responsavel: 'Maria Souza' },
  { id: 11, produtoId: 3, produtoNome: 'Módulo de Som Bluetooth', tipo: 'entrada', quantidade: 3, data: '2026-05-26', observacao: 'Reposição', responsavel: 'João Silva' },
  { id: 12, produtoId: 19, produtoNome: 'Central Multimídia Android', tipo: 'saida', quantidade: 1, data: '2026-05-26', observacao: 'Venda #0052', responsavel: 'Lucas Costa' },
]
