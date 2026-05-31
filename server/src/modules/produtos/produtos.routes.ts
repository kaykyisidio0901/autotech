import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const schema = z.object({
  categoriaId: z.number().optional().nullable(),
  fornecedorId: z.number().optional().nullable(),
  codigoInterno: z.string().min(1),
  codigoBarras: z.string().optional(),
  nome: z.string().min(2),
  marca: z.string().optional(),
  descricao: z.string().optional(),
  precoCusto: z.number().optional(),
  precoVenda: z.number(),
  quantidade: z.number().optional(),
  estoqueMinimo: z.number().optional(),
  status: z.boolean().optional(),
  imagem: z.string().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const catId = req.query.categoriaId as string | undefined
    const where: any = { empresaId: req.empresaId }

    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { codigoInterno: { contains: search } },
        { marca: { contains: search } },
      ]
    }
    if (catId) where.categoriaId = Number(catId)

    const produtos = await prisma.produto.findMany({
      where,
      include: { categoria: { select: { id: true, nome: true } } },
      orderBy: { nome: 'asc' },
    })
    res.json(produtos)
  } catch (err) { next(err) }
})

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const produto = await prisma.produto.findFirst({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      include: { categoria: { select: { id: true, nome: true } } },
    })
    if (!produto) throw new AppError('Produto não encontrado', 404)
    res.json(produto)
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.parse(req.body)
    const produto = await prisma.produto.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(produto)
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = schema.partial().parse(req.body)
    const produto = await prisma.produto.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data,
    })
    if (produto.count === 0) throw new AppError('Produto não encontrado', 404)
    res.json({ message: 'Produto atualizado' })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const produto = await prisma.produto.deleteMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
    })
    if (produto.count === 0) throw new AppError('Produto não encontrado', 404)
    res.json({ message: 'Produto removido' })
  } catch (err) { next(err) }
})

export default router
