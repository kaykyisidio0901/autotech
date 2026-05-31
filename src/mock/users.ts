import type { User } from '../types'

export const mockUsers: User[] = [
  { id: 1, nome: 'Carlos Alberto', email: 'admin@autotech.com', senha: '123456', role: 'proprietario', ativo: true },
  { id: 2, nome: 'João Silva', email: 'joao@autotech.com', senha: '123456', role: 'funcionario', ativo: true },
  { id: 3, nome: 'Maria Souza', email: 'maria@autotech.com', senha: '123456', role: 'funcionario', ativo: true },
  { id: 4, nome: 'Pedro Santos', email: 'pedro@autotech.com', senha: '123456', role: 'funcionario', ativo: false },
  { id: 5, nome: 'Ana Oliveira', email: 'ana@autotech.com', senha: '123456', role: 'funcionario', ativo: true },
  { id: 6, nome: 'Lucas Costa', email: 'lucas@autotech.com', senha: '123456', role: 'funcionario', ativo: true },
  { id: 7, nome: 'Roberta Mendes', email: 'gerente@autotech.com', senha: '123456', role: 'gerente', ativo: true },
]
