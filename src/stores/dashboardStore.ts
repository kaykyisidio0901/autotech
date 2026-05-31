import { create } from 'zustand'
import { api } from '../services/api'

interface DashboardData {
  vendasDia: number
  vendasMes: number
  produtosEstoque: number
  ordensServico: number
  clientes: number
  vendasSemana: number[]
}

interface DashboardStore extends DashboardData {
  loading: boolean
  fetch: () => Promise<void>
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  vendasDia: 0,
  vendasMes: 0,
  produtosEstoque: 0,
  ordensServico: 0,
  clientes: 0,
  vendasSemana: [],
  loading: false,

  fetch: async () => {
    set({ loading: true })
    try {
      const data = await api.get<any>('/dashboard')
      set({
        vendasDia: data.kpis.totalVendas || 0,
        vendasMes: data.kpis.receitaMes || 0,
        produtosEstoque: data.kpis.totalProdutos || 0,
        ordensServico: data.kpis.totalOrdens || 0,
        clientes: data.kpis.totalClientes || 0,
        vendasSemana: (data.vendasPorDia || []).map((v: any) => v.total),
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },
}))
