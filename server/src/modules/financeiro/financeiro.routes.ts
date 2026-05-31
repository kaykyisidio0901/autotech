import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const receberSchema = z.object({
  cliente: z.string(),
  descricao: z.string(),
  valor: z.number(),
  vencimento: z.string(),
  status: z.string().optional(),
})

const pagarSchema = z.object({
  fornecedor: z.string(),
  descricao: z.string(),
  valor: z.number(),
  vencimento: z.string(),
  status: z.string().optional(),
})

router.get('/receber', async (req: AuthRequest, res, next) => {
  try {
    const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;
  const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (start && end) {
      where.vencimento = { gte: new Date(start as string), lte: new Date(end as string) }
    }
    if (status) where.status = status
    const contas = await prisma.contaReceber.findMany({ where, orderBy: { vencimento: 'asc' } })
    res.json(contas)
  } catch (err) { return next(err) }
})

router.post('/receber', async (req: AuthRequest, res, next) => {
  try {
    const data = receberSchema.parse(req.body)
    const conta = await prisma.contaReceber.create({
      data: { ...data, vencimento: new Date(data.vencimento), empresaId: req.empresaId! },
    })
    res.status(201).json(conta)
  } catch (err) { return next(err) }
})

router.put('/receber/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = receberSchema.partial().parse(req.body)
    const updateData: any = { ...data }
    if (data.vencimento) updateData.vencimento = new Date(data.vencimento)
    const conta = await prisma.contaReceber.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data: updateData,
    })
    if (conta.count === 0) throw new AppError('Conta não encontrada', 404)
    res.json({ message: 'Conta atualizada' })
  } catch (err) { return next(err) }
})

router.get('/pagar', async (req: AuthRequest, res, next) => {
  try {
    const start = req.query.start as string | undefined;
  const end = req.query.end as string | undefined;
  const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (start && end) where.vencimento = { gte: new Date(start as string), lte: new Date(end as string) }
    if (status) where.status = status
    const contas = await prisma.contaPagar.findMany({ where, orderBy: { vencimento: 'asc' } })
    res.json(contas)
  } catch (err) { return next(err) }
})

router.post('/pagar', async (req: AuthRequest, res, next) => {
  try {
    const data = pagarSchema.parse(req.body)
    const conta = await prisma.contaPagar.create({
      data: { ...data, vencimento: new Date(data.vencimento), empresaId: req.empresaId! },
    })
    res.status(201).json(conta)
  } catch (err) { return next(err) }
})

router.put('/pagar/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = pagarSchema.partial().parse(req.body)
    const updateData: any = { ...data }
    if (data.vencimento) updateData.vencimento = new Date(data.vencimento)
    const conta = await prisma.contaPagar.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data: updateData,
    })
    if (conta.count === 0) throw new AppError('Conta não encontrada', 404)
    res.json({ message: 'Conta atualizada' })
  } catch (err) { return next(err) }
})

router.get('/resumo', async (req: AuthRequest, res, next) => {
  try {
    const [totalReceber, totalPagar, vendas, contasRec, contasPag] = await Promise.all([
      prisma.contaReceber.aggregate({ where: { empresaId: req.empresaId }, _sum: { valor: true } }),
      prisma.contaPagar.aggregate({ where: { empresaId: req.empresaId }, _sum: { valor: true } }),
      prisma.venda.aggregate({
        where: { empresaId: req.empresaId, status: 'concluida' },
        _sum: { total: true },
      }),
      prisma.contaReceber.findMany({
        where: { empresaId: req.empresaId, status: 'pendente' },
        orderBy: { vencimento: 'asc' },
        take: 10,
      }),
      prisma.contaPagar.findMany({
        where: { empresaId: req.empresaId, status: 'pendente' },
        orderBy: { vencimento: 'asc' },
        take: 10,
      }),
    ])

    res.json({
      receitaTotal: (vendas._sum.total || 0) + (totalReceber._sum.valor || 0),
      despesaTotal: totalPagar._sum.valor || 0,
      saldo: (vendas._sum.total || 0) + (totalReceber._sum.valor || 0) - (totalPagar._sum.valor || 0),
      contasReceber: contasRec,
      contasPagar: contasPag,
    })
  } catch (err) { return next(err) }
})

export default router
