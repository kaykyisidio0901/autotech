import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  razaoSocial: z.string().min(2),
  nomeFantasia: z.string().optional().default(''),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  endereco: z.string().optional(),
  ativo: z.boolean().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const where: any = { empresaId: req.empresaId }

    if (search) {
      where.OR = [
        { razaoSocial: { contains: search as string } },
        { cnpj: { contains: search as string } },
      ]
    }

    const fornecedores = await prisma.fornecedor.findMany({ where, orderBy: { razaoSocial: 'asc' } })
    res.json(fornecedores)
  } catch (err) { return next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const fornecedor = await prisma.fornecedor.create({ data: { ...data, nomeFantasia: data.nomeFantasia || '', empresaId: req.empresaId! } })
    res.status(201).json(fornecedor)
  } catch (err) { return next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.partial().parse(req.body)
    const fornecedor = await prisma.fornecedor.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data,
    })
    if (fornecedor.count === 0) throw new AppError('Fornecedor não encontrado', 404)
    res.json({ message: 'Fornecedor atualizado' })
  } catch (err) { return next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.fornecedor.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data: { ativo: false },
    })
    res.json({ message: 'Fornecedor desativado' })
  } catch (err) { return next(err) }
})

export default router
