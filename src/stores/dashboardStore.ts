import { create } from 'zustand'
import { mockDashboard } from '../mock/dashboard'

interface DashboardState {
  vendasDia: number
  vendasMes: number
  produtosEstoque: number
  ordensServico: number
  clientes: number
  vendasSemana: number[]
}

export const useDashboardStore = create<DashboardState>(() => ({
  ...mockDashboard,
}))
