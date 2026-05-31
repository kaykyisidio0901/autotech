import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const empresaId = req.empresaId!

    const [
      totalVendas,
      totalProdutos,
      totalClientes,
      totalOrdens,
      vendasMes,
      vendasRecentes,
      produtosBaixoEstoque,
      ordensPendentes,
      faturasPendentes,
    ] = await Promise.all([
      prisma.venda.count({ where: { empresaId, status: 'concluida' } }),
      prisma.produto.count({ where: { empresaId, status: true } }),
      prisma.cliente.count({ where: { empresaId } }),
      prisma.ordemServico.count({ where: { empresaId } }),
      prisma.venda.aggregate({
        where: { empresaId, status: 'concluida', data: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
        _sum: { total: true },
      }),
      prisma.venda.findMany({
        where: { empresaId },
        include: { itens: true },
        orderBy: { data: 'desc' },
        take: 10,
      }),
      prisma.produto.count({
        where: { empresaId, status: true, quantidade: { lte: 0 } },
      }),
      prisma.ordemServico.count({ where: { empresaId, status: { in: ['aberta', 'andamento'] } } }),
      prisma.contaReceber.count({ where: { empresaId, status: 'pendente', vencimento: { lte: new Date() } } }),
    ])

    const vendasPorDia = await prisma.venda.groupBy({
      by: ['data'],
      where: { empresaId, status: 'concluida' },
      _sum: { total: true },
      _count: true,
      orderBy: { data: 'asc' },
    })

    res.json({
      kpis: {
        totalVendas,
        receitaMes: vendasMes._sum.total || 0,
        totalProdutos,
        totalClientes,
        totalOrdens,
        produtosBaixoEstoque,
        ordensPendentes,
        faturasPendentes,
      },
      vendasRecentes,
      vendasPorDia: vendasPorDia.map(v => ({
        data: v.data.toISOString().split('T')[0],
        total: v._sum.total || 0,
        quantidade: v._count,
      })),
    })
  } catch (err) { next(err) }
})

export default router
