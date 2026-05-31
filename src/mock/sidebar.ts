import type { SidebarLink } from '../types'

type SidebarItem = SidebarLink | { divider: string }

export const sidebarLinks: SidebarItem[] = [
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
