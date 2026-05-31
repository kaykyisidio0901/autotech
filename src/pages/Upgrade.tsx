import { useState, useEffect } from 'react'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import { Check, X, Star, Zap, Shield, TrendingDown } from 'lucide-react'

const todasFuncionalidades = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'veiculos', label: 'Veículos' },
  { key: 'produtos', label: 'Produtos' },
  { key: 'estoque_basico', label: 'Estoque Básico' },
  { key: 'historico_vendas', label: 'Histórico de Vendas' },
  { key: 'relatorios_basicos', label: 'Relatórios Básicos' },
  { key: 'pdv', label: 'PDV Completo' },
  { key: 'estoque_avancado', label: 'Estoque Avançado' },
  { key: 'fornecedores', label: 'Fornecedores' },
  { key: 'contas_pagar', label: 'Contas a Pagar' },
  { key: 'contas_receber', label: 'Contas a Receber' },
  { key: 'fluxo_caixa', label: 'Fluxo de Caixa' },
  { key: 'ordens_servico', label: 'Ordens de Serviço' },
  { key: 'relatorios_avancados', label: 'Relatórios Avançados' },
  { key: 'funcionarios', label: 'Funcionários' },
  { key: 'dashboard_personalizavel', label: 'Dashboard Personalizável' },
  { key: 'importar_xml', label: 'Importação XML' },
  { key: 'catálogo_inteligente', label: 'Catálogo Inteligente' },
  { key: 'busca_imagens', label: 'Busca de Imagens' },
  { key: 'comissoes', label: 'Comissões' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'relatorios_premium', label: 'Relatórios Premium' },
  { key: 'oficina_completa', label: 'Oficina Completa' },
  { key: 'consulta_placa', label: 'Consulta de Placa' },
]

const icones = { basic: Star, medium: Zap, pro: Shield }

export function Upgrade() {
  const { assinatura, planos, upgrade, emTeste } = useSubscriptionStore()
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')
  const [confirmOpen, setConfirmOpen] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const store = useSubscriptionStore.getState()
      await Promise.all([store.fetchPlanos(), store.fetchMinhaAssinatura()])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !assinatura) return <LoadingSpinner />

  const planosExibir = planos.filter(p => {
    if (emTeste || assinatura.status === 'teste') return true
    const ordem = ['basic', 'medium', 'pro']
    return ordem.indexOf(p.id) >= ordem.indexOf(assinatura.planoId)
  })

  function handleUpgrade(planoId: string) {
    setConfirmOpen(planoId)
  }

  function confirmar() {
    if (!confirmOpen) return
    upgrade(confirmOpen as any, ciclo)
    setConfirmOpen(null)
  }

  const planoConfirm = planos.find(p => p.id === confirmOpen)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Comparar Planos</h1>
        <p className="text-sm text-gray-500 mt-1">Veja as diferenças entre os planos e escolha o ideal para você</p>
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

      {ciclo === 'anual' && (
        <Card className="border-accent/30 bg-accent/5">
          <div className="flex items-center gap-3">
            <TrendingDown size={20} className="text-accent" />
            <div>
              <p className="text-sm font-medium text-gray-200">Economia no plano anual</p>
              <p className="text-xs text-gray-500">
                Basic: economize {formatCurrency(planos[0].precoMensal * 12 - planos[0].precoAnual)} |
                Medium: economize {formatCurrency(planos[1].precoMensal * 12 - planos[1].precoAnual)} |
                Pro: economize {formatCurrency(planos[2].precoMensal * 12 - planos[2].precoAnual)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-500 font-medium px-4 py-3 min-w-[200px]">Funcionalidades</th>
              {planosExibir.map(p => {
                const Icon = icones[p.id]
                const preco = ciclo === 'mensal' ? p.precoMensal : p.precoAnual
                const isCurrent = p.id === assinatura.planoId && assinatura.status === 'ativa' && !emTeste
                return (
                  <th key={p.id} className={`px-4 py-3 min-w-[180px] ${p.destaque ? 'bg-accent/5' : ''}`}>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Icon size={18} className={p.destaque ? 'text-accent' : 'text-gray-400'} />
                        <span className="text-base font-bold text-gray-100">{p.nome}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-100">{ciclo === 'anual' ? `R$ ${preco.toFixed(0)}` : formatCurrency(preco)}<span className="text-xs text-gray-500 font-normal">/{ciclo === 'mensal' ? 'mês' : 'ano'}</span></p>
                      <Button
                        variant={isCurrent ? 'secondary' : p.destaque ? 'primary' : 'primary'}
                        className="mt-2 !py-1.5 !px-3 !text-xs"
                        disabled={isCurrent || (emTeste && p.id === assinatura.planoId)}
                        onClick={() => handleUpgrade(p.id)}>
                        {isCurrent ? 'Atual' : 'Escolher'}
                      </Button>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {todasFuncionalidades.map(({ key, label }) => (
              <tr key={key} className="border-t border-dark-600">
                <td className="px-4 py-3 text-gray-300">{label}</td>
                {planosExibir.map(p => {
                  const has = p.features[key]

                  const ordemP = ['basic', 'medium', 'pro']
                  const idx = ordemP.indexOf(p.id)
                  const prevPlan = idx > 0 ? planos.find(pp => pp.id === ordemP[idx - 1]) : null
                  const isHighlight = has && prevPlan && !prevPlan.features[key]

                  return (
                    <td key={p.id} className={`px-4 py-3 text-center ${p.destaque ? 'bg-accent/5' : ''}`}>
                      {has ? (
                        <div className="flex items-center justify-center gap-1">
                          <Check size={16} className="text-accent" />
                          {isHighlight && <span className="text-[10px] text-accent font-medium">NOVO</span>}
                        </div>
                      ) : (
                        <X size={16} className="text-gray-600 mx-auto" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={confirmOpen !== null} onClose={() => setConfirmOpen(null)} title="Confirmar Upgrade" size="sm">
        {planoConfirm && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-100">{planoConfirm.nome}</p>
              <p className="text-2xl font-bold text-accent mt-2">
                {ciclo === 'mensal' ? formatCurrency(planoConfirm.precoMensal) : formatCurrency(planoConfirm.precoAnual)}
                <span className="text-sm text-gray-500 font-normal">/{ciclo === 'mensal' ? 'mês' : 'ano'}</span>
              </p>
              {assinatura.planoId !== planoConfirm.id && (
                <p className="text-xs text-gray-500 mt-2">
                  Upgrade de {planos.find(p => p.id === assinatura.planoId)?.nome} para {planoConfirm.nome}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(null)}>Cancelar</Button>
              <Button fullWidth onClick={confirmar}>Confirmar Upgrade</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
