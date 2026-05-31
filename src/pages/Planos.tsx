import { useState } from 'react'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { formatCurrency } from '../utils/format'
import { Check, Star, Zap, Shield } from 'lucide-react'

const iconePlano = { basic: Star, medium: Zap, pro: Shield }

export function Planos() {
  const { planos, upgrade, assinatura, iniciarTeste, emTeste } = useSubscriptionStore()
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')
  const [confirmOpen, setConfirmOpen] = useState<typeof planos[0] | null>(null)

  function handleContratar(plano: typeof planos[0]) {
    if (plano.id === assinatura.planoId && assinatura.status === 'ativa') return
    setConfirmOpen(plano)
  }

  function confirmar() {
    if (!confirmOpen) return
    upgrade(confirmOpen.id, ciclo)
    setConfirmOpen(null)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100">Escolha seu Plano</h1>
        <p className="text-gray-500 mt-2">Selecione o plano ideal para sua empresa</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setCiclo('mensal')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${ciclo === 'mensal' ? 'bg-accent text-white' : 'bg-dark-800 text-gray-400 border border-dark-600'}`}>
          Mensal
        </button>
        <button onClick={() => setCiclo('anual')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative ${ciclo === 'anual' ? 'bg-accent text-white' : 'bg-dark-800 text-gray-400 border border-dark-600'}`}>
          Anual
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-dark-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Economize</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {planos.map(plano => {
          const Icon = iconePlano[plano.id]
          const preco = ciclo === 'mensal' ? plano.precoMensal : plano.precoAnual
          const economia = ciclo === 'anual' ? plano.precoMensal * 12 - plano.precoAnual : 0
          const isCurrent = plano.id === assinatura.planoId && assinatura.status === 'ativa' && !emTeste
          const isProTrial = emTeste || assinatura.status === 'teste'

          return (
            <div key={plano.id}
              className={`relative rounded-2xl border-2 transition-all duration-300 flex flex-col ${
                plano.destaque
                  ? 'border-accent scale-105 bg-dark-800 shadow-xl shadow-accent/10 z-10'
                  : 'border-dark-600 bg-dark-800/80 hover:border-dark-500'
              }`}>
              {plano.destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plano.destaque}
                </div>
              )}
              {plano.selo && !plano.destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-dark-600 text-gray-300 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plano.selo}
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plano.destaque ? 'bg-accent/20' : 'bg-dark-700'
                  }`}>
                    <Icon size={22} className={plano.destaque ? 'text-accent' : 'text-gray-400'} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-100">{plano.nome}</h2>
                    <p className="text-xs text-gray-500">{plano.descricao}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-100">
                      {ciclo === 'anual' ? `R$ ${plano.precoAnual.toFixed(0)}` : formatCurrency(preco)}
                    </span>
                    <span className="text-sm text-gray-500">/{ciclo === 'mensal' ? 'mês' : 'ano'}</span>
                  </div>
                  {economia > 0 && (
                    <p className="text-xs text-accent mt-1">Economia de {formatCurrency(economia)}/ano</p>
                  )}
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Funcionalidades</p>
                  {plano.funcionalidades.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dark-600 pt-4 mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Limites</p>
                  {plano.limites.map((lim, i) => (
                    <div key={i} className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-500">{lim.label}</span>
                      <span className="text-gray-200 font-medium">{lim.valor}</span>
                    </div>
                  ))}
                </div>

                <Button
                  fullWidth
                  variant={plano.destaque ? 'primary' : isCurrent ? 'secondary' : 'primary'}
                  disabled={isCurrent || (isProTrial && plano.id === 'pro')}
                  onClick={() => handleContratar(plano)}
                  className="!mt-auto">
                  {isCurrent ? 'Plano Atual' : isProTrial && plano.id === 'pro' ? 'Em Teste' : assinatura.planoId === plano.id ? 'Recontratar' : 'Assinar Agora'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">Quer testar antes de decidir?</p>
        <Button variant="secondary" onClick={iniciarTeste} disabled={emTeste || assinatura.status === 'teste'}>
          <Zap size={16} className="mr-2" />Iniciar Teste Grátis de 14 Dias
        </Button>
        {(emTeste || assinatura.status === 'teste') && (
          <p className="text-xs text-accent mt-2">
            Teste grátis ativo — {useSubscriptionStore.getState().diasRestantesTeste()} dias restantes
          </p>
        )}
      </div>

      <Modal open={confirmOpen !== null} onClose={() => setConfirmOpen(null)} title="Confirmar Assinatura" size="sm">
        {confirmOpen && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-100">{confirmOpen.nome}</p>
              <p className="text-2xl font-bold text-accent mt-2">
                {ciclo === 'mensal' ? formatCurrency(confirmOpen.precoMensal) : formatCurrency(confirmOpen.precoAnual)}
                <span className="text-sm text-gray-500 font-normal">/{ciclo === 'mensal' ? 'mês' : 'ano'}</span>
              </p>
            </div>
            {assinatura.planoId !== 'basic' && assinatura.status === 'ativa' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-400 text-center">
                Upgrade do plano {planos.find(p => p.id === assinatura.planoId)?.nome} → {confirmOpen.nome}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(null)}>Cancelar</Button>
              <Button fullWidth onClick={confirmar}>Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
