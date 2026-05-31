import { create } from 'zustand'
import { planos, mockAssinatura, mockHistoricoPagamentos, mockNotificacoesAssinatura } from '../mock/planos'
import type { PlanoId, Assinatura, PagamentoAssinatura, NotificacaoAssinatura, CicloFaturamento } from '../types'

interface SubscriptionState {
  planos: typeof planos
  assinatura: Assinatura
  pagamentos: PagamentoAssinatura[]
  notificacoes: NotificacaoAssinatura[]
  emTeste: boolean

  getPlano: (id: PlanoId) => typeof planos[0] | undefined
  hasFeature: (feature: string) => boolean
  checkFeature: (feature: string) => { liberado: boolean; planoMinimo: PlanoId | null }
  upgrade: (planoId: PlanoId, ciclo: CicloFaturamento) => void
  cancelar: () => void
  reativar: () => void
  alternarRenovacao: () => void
  marcarNotificacaoLida: (id: number) => void
  iniciarTeste: () => void
  diasRestantesTeste: () => number
  diasRestantesAssinatura: () => number
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  planos,
  assinatura: mockAssinatura,
  pagamentos: mockHistoricoPagamentos,
  notificacoes: mockNotificacoesAssinatura,
  emTeste: false,

  getPlano: (id) => planos.find(p => p.id === id),

  hasFeature: (feature) => {
    const { assinatura, emTeste } = get()
    if (emTeste) return true
    const plano = planos.find(p => p.id === assinatura.planoId)
    if (!plano) return false
    if (assinatura.status !== 'ativa' && assinatura.status !== 'teste') return false
    return plano.features[feature] === true
  },

  checkFeature: (feature) => {
    const { assinatura, emTeste } = get()
    if (emTeste || assinatura.status === 'teste') return { liberado: true, planoMinimo: null }

    const planoAtual = planos.find(p => p.id === assinatura.planoId)
    if (!planoAtual) return { liberado: false, planoMinimo: 'basic' }

    if (planoAtual.features[feature]) return { liberado: true, planoMinimo: null }

    const planoMinimo = planos.find(p => p.features[feature] === true)
    return { liberado: false, planoMinimo: planoMinimo ? planoMinimo.id : 'pro' }
  },

  upgrade: (planoId, ciclo) => {
    const plano = planos.find(p => p.id === planoId)
    if (!plano) return
    set(state => ({
      assinatura: {
        ...state.assinatura,
        planoId,
        ciclo,
        valor: ciclo === 'mensal' ? plano.precoMensal : plano.precoAnual,
        dataVencimento: ciclo === 'mensal'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'ativa',
      },
    }))
  },

  cancelar: () => {
    set(state => ({ assinatura: { ...state.assinatura, status: 'cancelada', renovacaoAutomatica: false } }))
  },

  reativar: () => {
    set(state => ({ assinatura: { ...state.assinatura, status: 'ativa', renovacaoAutomatica: true } }))
  },

  alternarRenovacao: () => {
    set(state => ({ assinatura: { ...state.assinatura, renovacaoAutomatica: !state.assinatura.renovacaoAutomatica } }))
  },

  marcarNotificacaoLida: (id) => {
    set(state => ({
      notificacoes: state.notificacoes.map(n => n.id === id ? { ...n, lida: true } : n),
    }))
  },

  iniciarTeste: () => {
    const dataFim = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    set({
      emTeste: true,
      assinatura: {
        ...get().assinatura,
        status: 'teste',
        dataTesteFim: dataFim,
        dataVencimento: dataFim,
        planoId: 'pro',
        valor: 0,
      },
    })
  },

  diasRestantesTeste: () => {
    const { assinatura, emTeste } = get()
    if (!emTeste && assinatura.status !== 'teste') return 0
    const fim = assinatura.dataTesteFim
    if (!fim) return 0
    const diff = new Date(fim).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },

  diasRestantesAssinatura: () => {
    const { assinatura } = get()
    const diff = new Date(assinatura.dataVencimento).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  },
}))
