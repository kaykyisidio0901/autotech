import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'

const router = Router()
router.use(authMiddleware)

const PLANOS = {
  basic: { nome: 'Basic', preco: 49.90, limites: { usuarios: 2, produtos: 100, clientes: 50 } },
  medium: { nome: 'Medium', preco: 99.90, limites: { usuarios: 5, produtos: 500, clientes: 200 } },
  pro: { nome: 'Pro', preco: 199.90, limites: { usuarios: 999, produtos: 9999, clientes: 9999 } },
}

router.get('/planos', (_req, res) => {
  res.json(PLANOS)
})

router.get('/minha', async (req: AuthRequest, res, next) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: req.empresaId },
      select: { planoId: true, assinaturaStatus: true, dataVencimento: true },
    })
    if (!empresa) throw new AppError('Empresa não encontrada', 404)

    const plano = PLANOS[empresa.planoId as keyof typeof PLANOS] || PLANOS.basic
    res.json({
      ...empresa,
      plano: { ...plano, id: empresa.planoId },
      diasTeste: empresa.dataVencimento
        ? Math.max(0, Math.ceil((new Date(empresa.dataVencimento).getTime() - Date.now()) / 86400000))
        : 0,
    })
  } catch (err) { return next(err) }
})

router.put('/upgrade', async (req: AuthRequest, res, next) => {
  try {
    const { planoId } = req.body
    if (!['basic', 'medium', 'pro'].includes(planoId)) {
      throw new AppError('Plano inválido', 400)
    }

    await prisma.empresa.update({
      where: { id: req.empresaId },
      data: {
        planoId,
        assinaturaStatus: 'ativo',
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    res.json({ message: `Plano alterado para ${PLANOS[planoId as keyof typeof PLANOS].nome}` })
  } catch (err) { return next(err) }
})

router.get('/status', async (req: AuthRequest, res, next) => {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: req.empresaId },
      select: {
        planoId: true,
        assinaturaStatus: true,
        dataVencimento: true,
        _count: { select: { users: true, produtos: true, clientes: true } },
      },
    })
    if (!empresa) throw new AppError('Empresa não encontrada', 404)

    const plano = PLANOS[empresa.planoId as keyof typeof PLANOS] || PLANOS.basic
    const bloqueado = empresa.assinaturaStatus === 'vencida' || (empresa.assinaturaStatus === 'teste' && empresa.dataVencimento && new Date(empresa.dataVencimento) < new Date())

    res.json({
      planoId: empresa.planoId,
      assinaturaStatus: empresa.assinaturaStatus,
      dataVencimento: empresa.dataVencimento,
      limites: plano.limites,
      usados: {
        usuarios: empresa._count.users,
        produtos: empresa._count.produtos,
        clientes: empresa._count.clientes,
      },
      bloqueado,
    })
  } catch (err) { return next(err) }
})

export default router
