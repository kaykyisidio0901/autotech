import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { empresaId: req.empresaId },
      include: { _count: { select: { produtos: true } } },
      orderBy: { nome: 'asc' },
    })
    const result = categorias.map(c => ({
      ...c,
      produtosCount: c._count.produtos,
      _count: undefined,
    }))
    res.json(result)
  } catch (err) { return next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const existing = await prisma.categoria.findFirst({
      where: { empresaId: req.empresaId, nome: data.nome },
    })
    if (existing) throw new AppError('Categoria já existe', 409)
    const categoria = await prisma.categoria.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(categoria)
  } catch (err) { return next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.partial().parse(req.body)
    const categoria = await prisma.categoria.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data,
    })
    if (categoria.count === 0) throw new AppError('Categoria não encontrada', 404)
    res.json({ message: 'Categoria atualizada' })
  } catch (err) { return next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.categoria.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data: { ativo: false },
    })
    res.json({ message: 'Categoria desativada' })
  } catch (err) { return next(err) }
})

export default router
