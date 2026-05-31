import { NavLink } from 'react-router-dom'
import { useSidebarStore } from '../../stores/sidebarStore'
import type { SidebarLink } from '../../types'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse,
  BarChart3, Users, Settings, Wrench, UsersRound,
  Briefcase, DollarSign, FileUp, ClipboardList,
  BookOpen, TrendingUp, Crown, CreditCard,
  ArrowUp, Receipt,
} from 'lucide-react'

const icons: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  vendas: <ShoppingCart size={20} />,
  clientes: <UsersRound size={20} />,
  produtos: <Package size={20} />,
  estoque: <Warehouse size={20} />,
  oficina: <Briefcase size={20} />,
  financeiro: <DollarSign size={20} />,
  relatorios: <BarChart3 size={20} />,
  xml: <FileUp size={20} />,
  compras: <ClipboardList size={20} />,
  usuarios: <Users size={20} />,
  config: <Settings size={20} />,
  catalogo: <BookOpen size={20} />,
  ranking: <TrendingUp size={20} />,
  planos: <Crown size={20} />,
  assinatura: <CreditCard size={20} />,
  upgrade: <ArrowUp size={20} />,
  faturamento: <Receipt size={20} />,
}

type SidebarItem = SidebarLink | { divider: string }

const sidebarLinks: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'PDV', path: '/pdv', icon: 'vendas' },
  { label: 'Vendas', path: '/vendas', icon: 'vendas' },
  { label: 'Clientes', path: '/clientes', icon: 'clientes' },
  { label: 'Produtos', path: '/produtos', icon: 'produtos' },
  { label: 'Catálogo', path: '/catalogo', icon: 'catalogo' },
  { label: 'Categorias', path: '/categorias', icon: 'produtos' },
  { label: 'Fornecedores', path: '/fornecedores', icon: 'produtos' },
  { label: 'Estoque', path: '/estoque', icon: 'estoque' },
  { label: 'Movimentações', path: '/movimentacoes', icon: 'estoque' },
  { label: 'Oficina', path: '/oficina', icon: 'oficina' },
  { label: 'Financeiro', path: '/financeiro', icon: 'financeiro' },
  { label: 'Relatórios', path: '/relatorios', icon: 'relatorios' },
  { label: 'Mais Vendidos', path: '/mais-vendidos', icon: 'ranking' },
  { label: 'Importar XML', path: '/importar-xml', icon: 'xml' },
  { label: 'Compras', path: '/compras', icon: 'compras' },
  { label: 'Histórico', path: '/historico', icon: 'relatorios' },
  { label: 'Usuários', path: '/usuarios', icon: 'usuarios' },
  { label: 'Configurações', path: '/configuracoes', icon: 'config' },
  { divider: 'Assinatura' },
  { label: 'Planos', path: '/planos', icon: 'planos' },
  { label: 'Minha Assinatura', path: '/minha-assinatura', icon: 'assinatura' },
  { label: 'Upgrade', path: '/upgrade', icon: 'upgrade' },
  { label: 'Faturamento', path: '/central-faturamento', icon: 'faturamento' },
]

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-600 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center gap-3 h-16 px-4 border-b border-dark-600">
        <Wrench size={22} className="text-accent" />
        {!collapsed && (
          <span className="text-lg font-bold text-gray-100 whitespace-nowrap">AutoTech</span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {sidebarLinks.map((item) => {
          if ('divider' in item) {
            if (collapsed) return null
            return (
              <div key={item.divider} className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">{item.divider}</span>
              </div>
            )
          }
          const link = item as SidebarLink
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-accent/15 text-accent font-medium'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-gray-200'
                }`
              }
            >
              <span className="flex items-center">{icons[link.icon] || <Package size={20} />}</span>
              {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-600">
        {!collapsed && (
          <p className="text-xs text-gray-600">AutoTech Manager v1.0</p>
        )}
      </div>
    </aside>
  )
}
