import { useSubscriptionStore } from '../stores/subscriptionStore'
import { planos } from '../mock/planos'
import { Card } from '../components/ui/Card'
import { BadgeStatus } from '../components/ui/BadgeStatus'
import { formatCurrency } from '../utils/format'
import { CreditCard, Download, FileText, Calendar } from 'lucide-react'

export function CentralFaturamento() {
  const { assinatura, pagamentos } = useSubscriptionStore()
  const plano = planos.find(p => p.id === assinatura.planoId)

  const statusPagamento: Record<string, 'success' | 'warning' | 'danger'> = {
    confirmado: 'success',
    pendente: 'warning',
    cancelado: 'danger',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Central de Faturamento</h1>
        <p className="text-sm text-gray-500 mt-1">Histórico de pagamentos e informações financeiras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <CreditCard size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Plano Atual</p>
              <p className="text-sm font-bold text-gray-100">{plano?.nome}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Valor</p>
              <p className="text-sm font-bold text-gray-100">{formatCurrency(assinatura.valor)}</p>
              <p className="text-[10px] text-gray-600">/{assinatura.ciclo === 'mensal' ? 'mês' : 'ano'}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Próximo Vencimento</p>
              <p className="text-sm font-bold text-gray-100">{new Date(assinatura.dataVencimento).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Download size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pago</p>
              <p className="text-sm font-bold text-gray-100">{formatCurrency(pagamentos.filter(p => p.status === 'confirmado').reduce((s, p) => s + p.valor, 0))}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Histórico de Pagamentos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left text-gray-500 font-medium px-3 py-3">Data</th>
                <th className="text-left text-gray-500 font-medium px-3 py-3">Descrição</th>
                <th className="text-left text-gray-500 font-medium px-3 py-3">Método</th>
                <th className="text-right text-gray-500 font-medium px-3 py-3">Valor</th>
                <th className="text-center text-gray-500 font-medium px-3 py-3">Status</th>
                <th className="text-center text-gray-500 font-medium px-3 py-3">Comprovante</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map(p => (
                <tr key={p.id} className="border-b border-dark-600 last:border-0">
                  <td className="px-3 py-3 text-gray-300">{new Date(p.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-3 py-3 text-gray-200">{p.descricao}</td>
                  <td className="px-3 py-3 text-gray-400">{p.metodo}</td>
                  <td className="px-3 py-3 text-right text-gray-200 font-medium">{p.valor === 0 ? 'Grátis' : formatCurrency(p.valor)}</td>
                  <td className="px-3 py-3 text-center">
                    <BadgeStatus label={p.status === 'confirmado' ? 'Confirmado' : p.status === 'pendente' ? 'Pendente' : 'Cancelado'} variant={statusPagamento[p.status]} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    {p.status === 'confirmado' && p.valor > 0 && (
                      <button className="text-xs text-accent hover:text-accent-hover cursor-pointer">Download</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Informações de Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Método Padrão</p>
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-200">Cartão de Crédito</p>
                <p className="text-xs text-gray-600">Final **** 4242</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-900 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Próximo Pagamento</p>
            <p className="text-sm text-gray-200">{formatCurrency(assinatura.valor)} em {new Date(assinatura.dataVencimento).toLocaleDateString('pt-BR')}</p>
            <p className="text-xs text-gray-600">{assinatura.renovacaoAutomatica ? 'Renovação automática' : 'Renovação manual'}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
