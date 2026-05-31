import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  tipo: z.enum(['entrada', 'saida', 'ajuste']),
  produtoId: z.number(),
  quantidade: z.number(),
  observacao: z.string().optional(),
  responsavel: z.string().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { start, end, tipo, produtoId } = req.query
    const where: any = { empresaId: req.empresaId }

    if (start && end) {
      where.data = { gte: new Date(start as string), lte: new Date(end as string) }
    }
    if (tipo) where.tipo = tipo
    if (produtoId) where.produtoId = parseInt(produtoId as string)

    const mov = await prisma.movimentacaoEstoque.findMany({
      where,
      include: { produto: { select: { id: true, nome: true } } },
      orderBy: { data: 'desc' },
    })
    res.json(mov)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const produto = await prisma.produto.findFirst({
      where: { id: data.produtoId, empresaId: req.empresaId },
    })
    if (!produto) throw new AppError('Produto não encontrado', 404)

    const mov = await prisma.movimentacaoEstoque.create({
      data: { ...data, empresaId: req.empresaId! },
    })

    if (data.tipo === 'entrada') {
      await prisma.produto.update({
        where: { id: data.produtoId },
        data: { quantidade: { increment: data.quantidade } },
      })
    } else if (data.tipo === 'saida') {
      if (produto.quantidade < data.quantidade) throw new AppError('Estoque insuficiente', 400)
      await prisma.produto.update({
        where: { id: data.produtoId },
        data: { quantidade: { decrement: data.quantidade } },
      })
    } else {
      await prisma.produto.update({
        where: { id: data.produtoId },
        data: { quantidade: data.quantidade },
      })
    }

    res.status(201).json(mov)
  } catch (err) { next(err) }
})

router.get('/estoque-geral', async (req: AuthRequest, res, next) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: { empresaId: req.empresaId },
      include: { categoria: { select: { nome: true } } },
      orderBy: { nome: 'asc' },
    })
    res.json(produtos)
  } catch (err) { next(err) }
})

export default router
