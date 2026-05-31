import { useSubscriptionStore } from '../stores/subscriptionStore'
import { planos } from '../mock/planos'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { formatCurrency } from '../utils/format'
import { Check, X, AlertTriangle, RefreshCw, Ban, Zap, ArrowUp } from 'lucide-react'

const statusVariant: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  ativa: 'success',
  expirada: 'danger',
  cancelada: 'danger',
  pendente: 'warning',
  teste: 'info',
}

const statusLabel: Record<string, string> = {
  ativa: 'Ativa',
  expirada: 'Expirada',
  cancelada: 'Cancelada',
  pendente: 'Pendente',
  teste: 'Em Teste',
}

export function MinhaAssinatura() {
  const { assinatura, emTeste, cancelar, reativar, alternarRenovacao, diasRestantesAssinatura, diasRestantesTeste, notificacoes, marcarNotificacaoLida } = useSubscriptionStore()
  const plano = planos.find(p => p.id === assinatura.planoId)
  const restantes = emTeste || assinatura.status === 'teste' ? diasRestantesTeste() : diasRestantesAssinatura()
  const naoLidas = notificacoes.filter(n => !n.lida)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Minha Assinatura</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie seu plano e faturamento</p>
      </div>

      {naoLidas.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <div className="space-y-2">
            {naoLidas.map(n => (
              <div key={n.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {n.tipo === 'vencimento' && <AlertTriangle size={16} className="text-yellow-400" />}
                  {n.tipo === 'confirmacao' && <Check size={16} className="text-accent" />}
                  {n.tipo === 'teste' && <Zap size={16} className="text-blue-400" />}
                  {n.tipo === 'upgrade' && <ArrowUp size={16} className="text-purple-400" />}
                  <p className="text-sm text-gray-300">{n.mensagem}</p>
                </div>
                <button onClick={() => marcarNotificacaoLida(n.id)} className="text-gray-600 hover:text-gray-400 cursor-pointer"><X size={14} /></button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Detalhes do Plano</h2>
              <BadgeStatus label={statusLabel[assinatura.status]} variant={statusVariant[assinatura.status]} />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-accent/15 flex items-center justify-center">
                <span className="text-xl font-bold text-accent">{plano?.nome[0]}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-100">{plano?.nome}</p>
                <p className="text-sm text-gray-500">{plano?.descricao}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-900 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Valor</p>
                <p className="text-lg font-bold text-gray-100">{formatCurrency(assinatura.valor)}</p>
                <p className="text-xs text-gray-600">/{assinatura.ciclo === 'mensal' ? 'mês' : 'ano'}</p>
              </div>
              <div className="bg-dark-900 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Vencimento</p>
                <p className="text-lg font-bold text-gray-100">{new Date(assinatura.dataVencimento).toLocaleDateString('pt-BR')}</p>
                <p className="text-xs text-gray-600">{restantes > 0 ? `${restantes} dias` : 'Vencido'}</p>
              </div>
              <div className="bg-dark-900 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Contratação</p>
                <p className="text-lg font-bold text-gray-100">{new Date(assinatura.dataContratacao).toLocaleDateString('pt-BR')}</p>
                <p className="text-xs text-gray-600">{assinatura.ciclo === 'mensal' ? 'Ciclo Mensal' : 'Ciclo Anual'}</p>
              </div>
              <div className="bg-dark-900 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Renovação</p>
                <p className="text-lg font-bold text-gray-100">{assinatura.renovacaoAutomatica ? 'Automática' : 'Manual'}</p>
                <p className="text-xs text-gray-600">{assinatura.renovacaoAutomatica ? 'Ativa' : 'Desligada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-dark-600">
              <Button variant="secondary" onClick={alternarRenovacao}>
                <RefreshCw size={16} className="mr-2" />
                {assinatura.renovacaoAutomatica ? 'Desativar Renovação' : 'Ativar Renovação'}
              </Button>
              {assinatura.status === 'ativa' ? (
                <Button variant="ghost" onClick={cancelar} className="text-red-400">
                  <Ban size={16} className="mr-2" />Cancelar Assinatura
                </Button>
              ) : (
                <Button variant="secondary" onClick={reativar}>
                  <RefreshCw size={16} className="mr-2" />Reativar
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Funcionalidades do Plano</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plano?.funcionalidades.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check size={14} className="text-accent shrink-0" />
                  <span className="text-gray-300">{f}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plano</span>
                <span className="text-gray-200 font-medium">{plano?.nome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <BadgeStatus label={statusLabel[assinatura.status]} variant={statusVariant[assinatura.status]} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor</span>
                <span className="text-gray-200 font-medium">{formatCurrency(assinatura.valor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Próximo Vencimento</span>
                <span className="text-gray-200">{new Date(assinatura.dataVencimento).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ciclo</span>
                <span className="text-gray-200">{assinatura.ciclo === 'mensal' ? 'Mensal' : 'Anual'}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Limites</h2>
            <div className="space-y-3">
              {plano?.limites.map((lim, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{lim.label}</span>
                  <span className="text-sm text-gray-200 font-medium">{lim.valor}</span>
                </div>
              ))}
            </div>
          </Card>

          {assinatura.planoId !== 'pro' && assinatura.status !== 'teste' && (
            <Button fullWidth onClick={() => window.location.href = '/upgrade'}>
              <ArrowUp size={16} className="mr-2" />Fazer Upgrade
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
