import { create } from 'zustand'
import { api } from '../services/api'
import type { Assinatura, PagamentoAssinatura, NotificacaoAssinatura, CicloFaturamento, Plano, PlanoId } from '../types'

interface SubscriptionState {
  planos: Plano[]
  assinatura: Assinatura | null
  pagamentos: PagamentoAssinatura[]
  notificacoes: NotificacaoAssinatura[]
  emTeste: boolean
  loading: boolean

  fetchPlanos: () => Promise<void>
  fetchMinhaAssinatura: () => Promise<void>
  getPlano: (id: PlanoId) => Plano | undefined
  hasFeature: (feature: string) => boolean
  checkFeature: (feature: string) => { liberado: boolean; planoMinimo: PlanoId | null }
  upgrade: (planoId: PlanoId, ciclo: CicloFaturamento) => Promise<void>
  cancelar: () => Promise<void>
  reativar: () => Promise<void>
  marcarNotificacaoLida: (id: number) => void
  alternarRenovacao: () => Promise<void>
  diasRestantesAssinatura: () => number
  diasRestantesTeste: () => number
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  planos: [],
  assinatura: null,
  pagamentos: [],
  notificacoes: [],
  emTeste: false,
  loading: false,

  fetchPlanos: async () => {
    try {
      const data = await api.get<Record<string, any>>('/assinaturas/planos')
      const planos = Object.entries(data).map(([id, p]: [string, any]) => ({
        id: id as PlanoId,
        nome: p.nome,
        descricao: p.descricao || `${p.nome} - Ideal para seu negócio`,
        precoMensal: p.preco || p.precoMensal || 0,
        precoAnual: p.precoAnual || (p.preco ? p.preco * 10 : 0),
        destaque: p.destaque || (id === 'pro' ? 'Mais Popular' : undefined),
        selo: p.selo,
        funcionalidades: p.funcionalidades || [],
        limites: p.limites?.usuarios ? [
          { label: 'Usuários', valor: `Até ${p.limites.usuarios}` },
          { label: 'Produtos', valor: `Até ${p.limites.produtos}` },
          { label: 'Clientes', valor: `Até ${p.limites.clientes}` },
        ] : p.limites || [],
        features: p.features || {},
      }))
      set({ planos })
    } catch { /* ignore */ }
  },

  fetchMinhaAssinatura: async () => {
    try {
      const data = await api.get<any>('/assinaturas/minha')
      const statusAssinatura = data.assinaturaStatus === 'teste' ? 'teste' as AssinaturaStatus : 'ativa' as AssinaturaStatus

      set({
        assinatura: {
          id: 1,
          planoId: data.planoId || 'basic',
          status: statusAssinatura,
          dataContratacao: data.dataContratacao || '',
          dataVencimento: data.dataVencimento || '',
          dataTesteFim: data.dataTesteFim,
          valor: data.plano?.preco || 0,
          ciclo: 'mensal' as CicloFaturamento,
          renovacaoAutomatica: data.renovacaoAutomatica ?? true,
          empresa: data.empresa || '',
          email: data.email || '',
        },
        emTeste: data.assinaturaStatus === 'teste',
      })
    } catch { /* ignore */ }
  },

  getPlano: (id) => get().planos.find(p => p.id === id),

  hasFeature: (feature) => {
    const { assinatura, emTeste } = get()
    if (emTeste) return true
    if (!assinatura) return false
    return true
  },

  checkFeature: (feature) => {
    const { assinatura, emTeste } = get()
    if (emTeste || assinatura?.status === 'teste') return { liberado: true, planoMinimo: null }
    return { liberado: true, planoMinimo: null }
  },

  upgrade: async (planoId, ciclo) => {
    await api.put('/assinaturas/upgrade', { planoId, ciclo })
    await get().fetchMinhaAssinatura()
  },

  cancelar: async () => {
    await api.post('/assinaturas/cancelar')
    await get().fetchMinhaAssinatura()
  },

  reativar: async () => {
    await api.post('/assinaturas/reativar')
    await get().fetchMinhaAssinatura()
  },

  marcarNotificacaoLida: (id) => {
    set(state => ({
      notificacoes: state.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n),
    }))
  },

  alternarRenovacao: async () => {
    const { assinatura } = get()
    if (!assinatura) return
    await api.put('/assinaturas/renovacao', { renovacaoAutomatica: !assinatura.renovacaoAutomatica })
    set({ assinatura: { ...assinatura, renovacaoAutomatica: !assinatura.renovacaoAutomatica } })
  },

  diasRestantesAssinatura: () => {
    const { assinatura } = get()
    if (!assinatura?.dataVencimento) return 0
    const diff = new Date(assinatura.dataVencimento).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },

  diasRestantesTeste: () => {
    const { assinatura } = get()
    if (!assinatura?.dataTesteFim) return 0
    const diff = new Date(assinatura.dataTesteFim).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },
}))
