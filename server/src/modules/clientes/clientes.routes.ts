import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  nome: z.string().min(2),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const where: any = { empresaId: req.empresaId }

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { cpf: { contains: search } },
        { telefone: { contains: search } },
      ]
    }

    const clientes = await prisma.cliente.findMany({
      where,
      include: { _count: { select: { veiculos: true } } },
      orderBy: { nome: 'asc' },
    })

    const result = clientes.map(c => ({
      ...c,
      veiculosCount: c._count.veiculos,
      _count: undefined,
    }))
    res.json(result)
  } catch (err) { next(err) }
})

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const cliente = await prisma.cliente.findFirst({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      include: { veiculos: true },
    })
    if (!cliente) throw new AppError('Cliente não encontrado', 404)
    res.json(cliente)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const cliente = await prisma.cliente.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(cliente)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const cliente = await prisma.cliente.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data,
    })
    if (cliente.count === 0) throw new AppError('Cliente não encontrado', 404)
    res.json({ message: 'Cliente atualizado' })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const cliente = await prisma.cliente.deleteMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
    })
    if (cliente.count === 0) throw new AppError('Cliente não encontrado', 404)
    res.json({ message: 'Cliente removido' })
  } catch (err) { next(err) }
})

export default router
