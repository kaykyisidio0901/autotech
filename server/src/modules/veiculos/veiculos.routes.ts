import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  clienteId: z.number(),
  placa: z.string().min(1),
  marca: z.string(),
  modelo: z.string(),
  ano: z.number().optional(),
  cor: z.string().optional(),
  chassi: z.string().optional(),
  renavam: z.string().optional(),
  combustivel: z.string().optional(),
  quilometragem: z.number().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const veiculos = await prisma.veiculo.findMany({
      where: { empresaId: req.empresaId },
      include: { cliente: { select: { nome: true } } },
      orderBy: { placa: 'asc' },
    })
    res.json(veiculos)
  } catch (err) { next(err) }
})

router.get('/cliente/:clienteId', async (req: AuthRequest, res, next) => {
  try {
    const veiculos = await prisma.veiculo.findMany({
      where: { empresaId: req.empresaId, clienteId: Number(req.params.clienteId) },
    })
    res.json(veiculos)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const existing = await prisma.veiculo.findFirst({
      where: { empresaId: req.empresaId, placa: data.placa },
    })
    if (existing) throw new AppError('Placa já cadastrada', 409)
    const veiculo = await prisma.veiculo.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(veiculo)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.partial().parse(req.body)
    const veiculo = await prisma.veiculo.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data,
    })
    if (veiculo.count === 0) throw new AppError('Veículo não encontrado', 404)
    res.json({ message: 'Veículo atualizado' })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const veiculo = await prisma.veiculo.deleteMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
    })
    if (veiculo.count === 0) throw new AppError('Veículo não encontrado', 404)
    res.json({ message: 'Veículo removido' })
  } catch (err) { next(err) }
})

export default router
