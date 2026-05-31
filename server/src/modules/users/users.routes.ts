import { Router } from 'express'
import { authMiddleware, requireRole, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const userSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6).optional(),
  role: z.enum(['admin', 'gerente', 'funcionario']),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { empresaId: req.empresaId },
      select: { id: true, nome: true, email: true, role: true, telefone: true, cargo: true, ativo: true, createdAt: true },
      orderBy: { nome: 'asc' },
    })
    res.json(users)
  } catch (err) { return next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = userSchema.parse(req.body)
    const existing = await prisma.user.findFirst({ where: { empresaId: req.empresaId, email: data.email } })
    if (existing) throw new AppError('Email já cadastrado', 409)

    const senhaHash = data.senha ? await bcrypt.hash(data.senha, 10) : await bcrypt.hash('123456', 10)
    const user = await prisma.user.create({
      data: { ...data, senha: senhaHash, empresaId: req.empresaId! },
      select: { id: true, nome: true, email: true, role: true, telefone: true, cargo: true, ativo: true },
    })
    res.status(201).json(user)
  } catch (err) { return next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = userSchema.partial().parse(req.body)
    if (data.senha) data.senha = await bcrypt.hash(data.senha, 10)
    const user = await prisma.user.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data,
    })
    if (user.count === 0) throw new AppError('Usuário não encontrado', 404)
    res.json({ message: 'Usuário atualizado' })
  } catch (err) { return next(err) }
})

router.delete('/:id', requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.updateMany({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      data: { ativo: false },
    })
    if (user.count === 0) throw new AppError('Usuário não encontrado', 404)
    res.json({ message: 'Usuário desativado' })
  } catch (err) { return next(err) }
})

export default router
