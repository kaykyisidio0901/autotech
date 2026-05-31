import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  numero: z.string(),
  fornecedor: z.string(),
  cnpj: z.string().optional(),
  dataEmissao: z.string(),
  valorTotal: z.number(),
  parcelas: z.number().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notas = await prisma.notaFiscal.findMany({
      where: { empresaId: req.empresaId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(notas)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const nota = await prisma.notaFiscal.create({
      data: {
        ...data,
        dataEmissao: new Date(data.dataEmissao),
        empresaId: req.empresaId!,
      },
    })
    res.status(201).json(nota)
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.notaFiscal.deleteMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
    })
    res.json({ message: 'Nota removida' })
  } catch (err) { next(err) }
})

export default router
