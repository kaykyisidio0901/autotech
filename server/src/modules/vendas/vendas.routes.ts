import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const itemSchema = z.object({
  produtoId: z.number().optional().nullable(),
  produtoNome: z.string(),
  quantidade: z.number().min(1),
  precoUnitario: z.number(),
  total: z.number(),
})

const createSchema = z.object({
  clienteId: z.number().optional().nullable(),
  vendedorId: z.number().optional().nullable(),
  total: z.number(),
  desconto: z.number().optional(),
  formaPagamento: z.string(),
  parcelas: z.number().optional(),
  status: z.string().optional(),
  data: z.string().optional(),
  itens: z.array(itemSchema).min(1),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;
  const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }

    if (start && end) {
      where.data = { gte: new Date(start as string), lte: new Date(end as string) }
    }
    if (status) where.status = status

    const vendas = await prisma.venda.findMany({
      where,
      include: { itens: true },
      orderBy: { data: 'desc' },
    })
    res.json(vendas)
  } catch (err) { return next(err) }
})

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const venda = await prisma.venda.findFirst({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      include: { itens: true },
    })
    if (!venda) throw new AppError('Venda não encontrada', 404)
    res.json(venda)
  } catch (err) { return next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const venda = await prisma.venda.create({
      data: {
        empresaId: req.empresaId!,
        clienteId: data.clienteId,
        vendedorId: data.vendedorId,
        total: data.total,
        desconto: data.desconto || 0,
        formaPagamento: data.formaPagamento,
        parcelas: data.parcelas || 1,
        status: data.status || 'concluida',
        data: data.data ? new Date(data.data) : new Date(),
        itens: { create: data.itens },
      },
      include: { itens: true },
    })

    for (const item of data.itens) {
      if (item.produtoId) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: { quantidade: { decrement: item.quantidade } },
        })
        await prisma.movimentacaoEstoque.create({
          data: {
            empresaId: req.empresaId!,
            produtoId: item.produtoId,
            tipo: 'saida',
            quantidade: item.quantidade,
            observacao: `Venda #${venda.id}`,
            responsavel: 'Sistema',
          },
        })
      }
    }

    res.status(201).json(venda)
  } catch (err) { return next(err) }
})

router.put('/:id/cancel', async (req: AuthRequest, res, next) => {
  try {
    const venda = await prisma.venda.findFirst({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      include: { itens: true },
    })
    if (!venda) throw new AppError('Venda não encontrada', 404)

    await prisma.venda.update({
      where: { id: venda.id },
      data: { status: 'cancelada' },
    })

    for (const item of venda.itens) {
      if (item.produtoId) {
        await prisma.produto.update({
          where: { id: item.produtoId },
          data: { quantidade: { increment: item.quantidade } },
        })
      }
    }

    res.json({ message: 'Venda cancelada' })
  } catch (err) { return next(err) }
})

export default router
