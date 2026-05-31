import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  numeroNfe: z.string().optional(),
  fornecedor: z.string(),
  data: z.string().optional(),
  valor: z.number(),
  quantidadeProdutos: z.number().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const compras = await prisma.compra.findMany({
      where: { empresaId: req.empresaId },
      orderBy: { data: 'desc' },
    })
    res.json(compras)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const compra = await prisma.compra.create({
      data: { ...data, data: data.data ? new Date(data.data) : new Date(), empresaId: req.empresaId! },
    })
    res.status(201).json(compra)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.compra.deleteMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
    })
    res.json({ message: 'Compra removida' })
  } catch (err) { next(err) }
})

export default router
