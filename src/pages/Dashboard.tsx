import { useEffect } from 'react'
import { useDashboardStore } from '../stores/dashboardStore'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { MockChart } from '../components/charts/MockChart'
import { DollarSign, TrendingUp, Package, Wrench, Users } from 'lucide-react'

export function Dashboard() {
  const { vendasDia, vendasMes, produtosEstoque, ordensServico, clientes, vendasSemana, fetch: fetchDashboard } =
    useDashboardStore()
  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Vendas do Dia" value={`R$ ${vendasDia.toLocaleString('pt-BR')}`} icon={<DollarSign size={22} />} accent />
        <StatCard title="Vendas do Mês" value={`R$ ${vendasMes.toLocaleString('pt-BR')}`} icon={<TrendingUp size={22} />} accent />
        <StatCard title="Produtos em Estoque" value={produtosEstoque} icon={<Package size={22} />} />
        <StatCard title="Ordens de Serviço" value={ordensServico} icon={<Wrench size={22} />} />
        <StatCard title="Clientes" value={clientes} icon={<Users size={22} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Vendas dos Últimos 7 Dias</h2>
          <MockChart data={vendasSemana} />
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Últimas Ordens de Serviço</h2>
          <div className="space-y-3">
            {[
              { id: '#OS-0042', cliente: 'Fernando Lima', status: 'Em andamento', valor: 'R$ 1.200' },
              { id: '#OS-0041', cliente: 'Juliana Costa', status: 'Concluído', valor: 'R$ 850' },
              { id: '#OS-0040', cliente: 'Roberto Alves', status: 'Aguardando peças', valor: 'R$ 2.300' },
              { id: '#OS-0039', cliente: 'Camila Rocha', status: 'Concluído', valor: 'R$ 540' },
              { id: '#OS-0038', cliente: 'Diego Martins', status: 'Em andamento', valor: 'R$ 1.780' },
            ].map((os) => (
              <div key={os.id} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                <div>
                  <p className="text-sm text-gray-200 font-medium">{os.cliente}</p>
                  <p className="text-xs text-gray-500">{os.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-200">{os.valor}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    os.status === 'Concluído'
                      ? 'bg-green-500/20 text-green-400'
                      : os.status === 'Em andamento'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {os.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
