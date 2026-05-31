import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { Login } from '../pages/Login'
import { Dashboard } from '../pages/Dashboard'
import { Users } from '../pages/Users'
import { Vendas } from '../pages/Vendas'
import { Produtos } from '../pages/Produtos'
import { Categorias } from '../pages/Categorias'
import { Fornecedores } from '../pages/Fornecedores'
import { Estoque } from '../pages/Estoque'
import { Movimentacoes } from '../pages/Movimentacoes'
import { PDV } from '../pages/PDV'
import { HistoricoVendas } from '../pages/HistoricoVendas'
import { Clientes } from '../pages/Clientes'
import { OrdensServico } from '../pages/OrdensServico'
import { Financeiro } from '../pages/Financeiro'
import { Relatorios } from '../pages/Relatorios'
import { ImportarXML } from '../pages/ImportarXML'
import { Compras } from '../pages/Compras'
import { Configuracoes } from '../pages/Configuracoes'
import { Catalogo } from '../pages/Catalogo'
import { MaisVendidos } from '../pages/MaisVendidos'
import { Planos } from '../pages/Planos'
import { MinhaAssinatura } from '../pages/MinhaAssinatura'
import { Upgrade } from '../pages/Upgrade'
import { CentralFaturamento } from '../pages/CentralFaturamento'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'pdv', element: <PDV /> },
      { path: 'vendas', element: <Vendas /> },
      { path: 'produtos', element: <Produtos /> },
      { path: 'catalogo', element: <Catalogo /> },
      { path: 'categorias', element: <Categorias /> },
      { path: 'fornecedores', element: <Fornecedores /> },
      { path: 'estoque', element: <Estoque /> },
      { path: 'movimentacoes', element: <Movimentacoes /> },
      { path: 'historico', element: <HistoricoVendas /> },
      { path: 'clientes', element: <Clientes /> },
      { path: 'oficina', element: <OrdensServico /> },
      { path: 'financeiro', element: <Financeiro /> },
      { path: 'relatorios', element: <Relatorios /> },
      { path: 'mais-vendidos', element: <MaisVendidos /> },
      { path: 'importar-xml', element: <ImportarXML /> },
      { path: 'compras', element: <Compras /> },
      { path: 'configuracoes', element: <Configuracoes /> },
      { path: 'usuarios', element: <Users /> },
      { path: 'planos', element: <Planos /> },
      { path: 'minha-assinatura', element: <MinhaAssinatura /> },
      { path: 'upgrade', element: <Upgrade /> },
      { path: 'central-faturamento', element: <CentralFaturamento /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
])
