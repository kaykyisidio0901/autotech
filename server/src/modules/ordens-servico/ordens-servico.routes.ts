import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../../middlewares/auth'
import { prisma } from '../../database/prisma'
import { AppError } from '../../errors/AppError'
import { z } from 'zod'

const router = Router()
router.use(authMiddleware)

const servicoSchema = z.object({ descricao: z.string(), valor: z.number() })
const produtoSchema = z.object({ nome: z.string(), quantidade: z.number(), valor: z.number() })

const createSchema = z.object({
  clienteId: z.number(),
  veiculoId: z.number().optional().nullable(),
  numero: z.string().min(1),
  dataEntrada: z.string().optional(),
  dataPrevista: z.string().optional(),
  responsavel: z.string().optional(),
  observacoes: z.string().optional(),
  valorMaoObra: z.number().optional(),
  valorProdutos: z.number().optional(),
  desconto: z.number().optional(),
  status: z.string().optional(),
  servicos: z.array(servicoSchema).optional(),
  produtosOS: z.array(produtoSchema).optional(),
})

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (status) where.status = status

    const ordens = await prisma.ordemServico.findMany({
      where,
      include: {
        servicos: true,
        produtosOS: true,
        cliente: { select: { id: true, nome: true } },
      } as any,
      orderBy: { createdAt: 'desc' },
    })
    res.json(ordens)
  } catch (err) { return next(err) }
})

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const os = await prisma.ordemServico.findFirst({
      where: { id: Number(req.params.id), empresaId: req.empresaId },
      include: { servicos: true, produtosOS: true, cliente: { select: { nome: true } } } as any,
    })
    if (!os) throw new AppError('Ordem de serviço não encontrada', 404)
    res.json(os)
  } catch (err) { return next(err) }
})

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body)
    const valorFinal = (data.valorMaoObra || 0) + (data.valorProdutos || 0) - (data.desconto || 0)
    const os = await prisma.ordemServico.create({
      data: {
        empresaId: req.empresaId!,
        clienteId: data.clienteId,
        veiculoId: data.veiculoId,
        numero: data.numero,
        dataEntrada: data.dataEntrada ? new Date(data.dataEntrada) : new Date(),
        dataPrevista: data.dataPrevista ? new Date(data.dataPrevista) : null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
        valorMaoObra: data.valorMaoObra || 0,
        valorProdutos: data.valorProdutos || 0,
        desconto: data.desconto || 0,
        valorFinal,
        status: data.status || 'aberta',
        servicos: data.servicos ? { create: data.servicos } : undefined,
        produtosOS: data.produtosOS ? { create: data.produtosOS } : undefined,
      } as any,
      include: { servicos: true, produtosOS: true } as any,
    })
    res.status(201).json(os)
  } catch (err) { return next(err) }
})

router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.partial().parse(req.body)
    const updateData: any = { ...data }
    if (data.dataEntrada) updateData.dataEntrada = new Date(data.dataEntrada)
    if (data.dataPrevista) updateData.dataPrevista = new Date(data.dataPrevista)

    const campos = ['clienteId', 'veiculoId', 'numero', 'responsavel', 'observacoes', 'valorMaoObra', 'valorProdutos', 'desconto', 'status']
    const setData: any = {}
    for (const key of campos) {
      if (key in data) setData[key] = (data as any)[key]
    }

    if ('valorMaoObra' in data || 'valorProdutos' in data || 'desconto' in data) {
      const current = await prisma.ordemServico.findFirst({ where: { id: Number(req.params.id) } })
      if (current) {
        setData.valorFinal = (setData.valorMaoObra ?? current.valorMaoObra) + (setData.valorProdutos ?? current.valorProdutos) - (setData.desconto ?? current.desconto)
      }
    }

    if (data.servicos) {
      await prisma.oSServico.deleteMany({ where: { osId: Number(req.params.id) } })
      setData.servicos = { create: data.servicos }
    }
    if (data.produtosOS) {
      await (prisma as any).oSProduto.deleteMany({ where: { osId: Number(req.params.id) } })
      setData.produtosOS = { create: data.produtosOS }
    }

    const os = await prisma.ordemServico.update({
      where: { id: Number(req.params.id) },
      data: setData,
      include: { servicos: true, produtosOS: true } as any,
    })
    res.json(os)
  } catch (err) { return next(err) }
})

export default router
