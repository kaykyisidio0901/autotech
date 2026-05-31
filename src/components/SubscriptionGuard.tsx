import { useSubscriptionStore } from '../stores/subscriptionStore'
import { planos } from '../mock/planos'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Lock, ArrowUp } from 'lucide-react'
import type { Plano } from '../types'

interface Props {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ feature, children, fallback }: Props) {
  const { hasFeature, assinatura } = useSubscriptionStore()
  const liberado = hasFeature(feature)

  if (liberado) return <>{children}</>

  const planoMinimo = (planos as Plano[]).find(p => p.features[feature] === true)
  const nomePlano = planoMinimo?.nome || 'Medium'

  if (fallback) return <>{fallback}</>

  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4">
          <Lock size={28} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Recurso Bloqueado</h3>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          Este recurso está disponível apenas nos planos <strong className="text-gray-300">{nomePlano}</strong> e <strong className="text-gray-300">Pro</strong>.
          {assinatura.planoId !== 'basic' && assinatura.status === 'ativa' && (
            <> Faça um upgrade para liberar esta funcionalidade.</>
          )}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.href = '/upgrade'}>
            <ArrowUp size={16} className="mr-2" />Fazer Upgrade
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/planos'}>
            Ver Planos
          </Button>
        </div>
      </div>
    </Card>
  )
}
