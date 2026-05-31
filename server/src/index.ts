import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()
const app = express()
const PORT = parseInt(process.env.PORT || '3001')
const JWT_SECRET = process.env.JWT_SECRET || 'autotech-jwt-secret'
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

app.use(cors())
app.use(express.json())

// --- Inline Types ---
interface AuthRequest extends express.Request {
  userId?: number
  empresaId?: number
  userRole?: string
}

interface JwtPayload {
  userId: number
  empresaId: number
  role: string
}

// --- Inline Auth Middleware ---
function authMiddleware(req: AuthRequest, _res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return void _res.status(401).json({ error: 'Token não fornecido' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.userId = decoded.userId
    req.empresaId = decoded.empresaId
    req.userRole = decoded.role
    next()
  } catch {
    return void _res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: express.Response, next: express.NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return void _res.status(403).json({ error: 'Acesso não autorizado' })
    }
    next()
  }
}

// --- Inline AppError ---
class AppError extends Error {
  public statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

// --- Health / Ping ---
app.get('/api/ping', (_req, res) => { res.json({ pong: true }) })
app.get('/api/health', (_req, res) => {
  res.set('Content-Type', 'application/json')
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==========================================================================
// AUTH  /api/auth
// ==========================================================================
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
})
const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  razaoSocial: z.string().min(2),
  cnpj: z.string().min(14),
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, senha } = loginSchema.parse(req.body)
    const user = await prisma.user.findFirst({ where: { email, ativo: true } })
    if (!user) throw new AppError('Credenciais inválidas', 401)
    const valid = await bcrypt.compare(senha, user.senha)
    if (!valid) throw new AppError('Credenciais inválidas', 401)
    const empresa = await prisma.empresa.findUnique({ where: { id: user.empresaId } })
    if (!empresa) throw new AppError('Empresa não encontrada', 404)
    const token = jwt.sign({ userId: user.id, empresaId: user.empresaId, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions)
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role }, empresa: { id: empresa.id, razaoSocial: empresa.razaoSocial, nomeFantasia: empresa.nomeFantasia } })
  } catch (err) { next(err) }
})

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.empresa.findUnique({ where: { cnpj: data.cnpj } })
    if (existing) throw new AppError('CNPJ já cadastrado', 409)
    const emailExists = await prisma.user.findFirst({ where: { email: data.email } })
    if (emailExists) throw new AppError('Email já cadastrado', 409)
    const senhaHash = await bcrypt.hash(data.senha, 10)
    const empresa = await prisma.empresa.create({
      data: {
        razaoSocial: data.razaoSocial,
        nomeFantasia: data.razaoSocial,
        cnpj: data.cnpj,
        assinaturaStatus: 'teste',
        planoId: 'pro',
        dataVencimento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        users: { create: { nome: data.nome, email: data.email, senha: senhaHash, role: 'admin' } },
      },
      include: { users: true },
    })
    const token = jwt.sign({ userId: empresa.users[0].id, empresaId: empresa.id, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions)
    res.status(201).json({ token, user: { id: empresa.users[0].id, nome: empresa.users[0].nome, email: empresa.users[0].email, role: empresa.users[0].role }, empresa: { id: empresa.id, razaoSocial: empresa.razaoSocial, nomeFantasia: empresa.nomeFantasia, planoId: empresa.planoId, assinaturaStatus: empresa.assinaturaStatus } })
  } catch (err) { next(err) }
})

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! }, include: { empresa: true } })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    res.json({ id: user.id, nome: user.nome, email: user.email, role: user.role, empresa: { id: user.empresa.id, razaoSocial: user.empresa.razaoSocial, nomeFantasia: user.empresa.nomeFantasia, planoId: user.empresa.planoId, assinaturaStatus: user.empresa.assinaturaStatus } })
  } catch (err) { next(err) }
})

// ==========================================================================
// USERS  /api/users
// ==========================================================================
const userSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6).optional(),
  role: z.enum(['admin', 'gerente', 'funcionario']),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
})

app.get('/api/users', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { empresaId: req.empresaId },
      select: { id: true, nome: true, email: true, role: true, telefone: true, cargo: true, ativo: true, createdAt: true },
      orderBy: { nome: 'asc' },
    })
    res.json(users)
  } catch (err) { next(err) }
})

app.post('/api/users', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = userSchema.parse(req.body)
    const existing = await prisma.user.findFirst({ where: { empresaId: req.empresaId, email: data.email } })
    if (existing) throw new AppError('Email já cadastrado', 409)
    const senhaHash = data.senha ? await bcrypt.hash(data.senha, 10) : await bcrypt.hash('123456', 10)
    const user = await prisma.user.create({ data: { ...data, senha: senhaHash, empresaId: req.empresaId! }, select: { id: true, nome: true, email: true, role: true, telefone: true, cargo: true, ativo: true } })
    res.status(201).json(user)
  } catch (err) { next(err) }
})

app.put('/api/users/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = userSchema.partial().parse(req.body)
    if (data.senha) data.senha = await bcrypt.hash(data.senha, 10)
    const user = await prisma.user.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data })
    if (user.count === 0) throw new AppError('Usuário não encontrado', 404)
    res.json({ message: 'Usuário atualizado' })
  } catch (err) { next(err) }
})

app.delete('/api/users/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data: { ativo: false } })
    if (user.count === 0) throw new AppError('Usuário não encontrado', 404)
    res.json({ message: 'Usuário desativado' })
  } catch (err) { next(err) }
})

// ==========================================================================
// CLIENTES  /api/clientes
// ==========================================================================
const clienteSchema = z.object({
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

app.get('/api/clientes', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (search) where.OR = [{ nome: { contains: search } }, { cpf: { contains: search } }, { telefone: { contains: search } }]
    const clientes = await prisma.cliente.findMany({ where, include: { _count: { select: { veiculos: true } } }, orderBy: { nome: 'asc' } })
    res.json(clientes.map(c => ({ ...c, veiculosCount: c._count.veiculos, _count: undefined })))
  } catch (err) { next(err) }
})

app.get('/api/clientes/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const cliente = await prisma.cliente.findFirst({ where: { id: Number(req.params.id), empresaId: req.empresaId }, include: { veiculos: true } })
    if (!cliente) throw new AppError('Cliente não encontrado', 404)
    res.json(cliente)
  } catch (err) { next(err) }
})

app.post('/api/clientes', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = clienteSchema.parse(req.body)
    const cliente = await prisma.cliente.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(cliente)
  } catch (err) { next(err) }
})

app.put('/api/clientes/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = clienteSchema.partial().parse(req.body)
    const cliente = await prisma.cliente.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data })
    if (cliente.count === 0) throw new AppError('Cliente não encontrado', 404)
    res.json({ message: 'Cliente atualizado' })
  } catch (err) { next(err) }
})

app.delete('/api/clientes/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const cliente = await prisma.cliente.deleteMany({ where: { id: Number(req.params.id), empresaId: req.empresaId } })
    if (cliente.count === 0) throw new AppError('Cliente não encontrado', 404)
    res.json({ message: 'Cliente removido' })
  } catch (err) { next(err) }
})

// ==========================================================================
// VEICULOS  /api/veiculos
// ==========================================================================
const veiculoSchema = z.object({
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

app.get('/api/veiculos', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const veiculos = await prisma.veiculo.findMany({ where: { empresaId: req.empresaId }, include: { cliente: { select: { nome: true } } }, orderBy: { placa: 'asc' } })
    res.json(veiculos)
  } catch (err) { next(err) }
})

app.get('/api/veiculos/cliente/:clienteId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const veiculos = await prisma.veiculo.findMany({ where: { empresaId: req.empresaId, clienteId: Number(req.params.clienteId) } })
    res.json(veiculos)
  } catch (err) { next(err) }
})

app.post('/api/veiculos', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = veiculoSchema.parse(req.body)
    const existing = await prisma.veiculo.findFirst({ where: { empresaId: req.empresaId, placa: data.placa } })
    if (existing) throw new AppError('Placa já cadastrada', 409)
    const veiculo = await prisma.veiculo.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(veiculo)
  } catch (err) { next(err) }
})

app.put('/api/veiculos/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = veiculoSchema.partial().parse(req.body)
    const veiculo = await prisma.veiculo.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data })
    if (veiculo.count === 0) throw new AppError('Veículo não encontrado', 404)
    res.json({ message: 'Veículo atualizado' })
  } catch (err) { next(err) }
})

app.delete('/api/veiculos/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const veiculo = await prisma.veiculo.deleteMany({ where: { id: Number(req.params.id), empresaId: req.empresaId } })
    if (veiculo.count === 0) throw new AppError('Veículo não encontrado', 404)
    res.json({ message: 'Veículo removido' })
  } catch (err) { next(err) }
})

// ==========================================================================
// PRODUTOS  /api/produtos
// ==========================================================================
const produtoSchema = z.object({
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

app.get('/api/produtos', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const catId = req.query.categoriaId as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (search) where.OR = [{ nome: { contains: search } }, { codigoInterno: { contains: search } }, { marca: { contains: search } }]
    if (catId) where.categoriaId = Number(catId)
    const produtos = await prisma.produto.findMany({ where, include: { categoria: { select: { id: true, nome: true } } }, orderBy: { nome: 'asc' } })
    res.json(produtos)
  } catch (err) { next(err) }
})

app.get('/api/produtos/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const produto = await prisma.produto.findFirst({ where: { id: Number(req.params.id), empresaId: req.empresaId }, include: { categoria: { select: { id: true, nome: true } } } })
    if (!produto) throw new AppError('Produto não encontrado', 404)
    res.json(produto)
  } catch (err) { next(err) }
})

app.post('/api/produtos', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = produtoSchema.parse(req.body)
    const produto = await prisma.produto.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(produto)
  } catch (err) { next(err) }
})

app.put('/api/produtos/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = produtoSchema.partial().parse(req.body)
    const produto = await prisma.produto.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data })
    if (produto.count === 0) throw new AppError('Produto não encontrado', 404)
    res.json({ message: 'Produto atualizado' })
  } catch (err) { next(err) }
})

app.delete('/api/produtos/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const produto = await prisma.produto.deleteMany({ where: { id: Number(req.params.id), empresaId: req.empresaId } })
    if (produto.count === 0) throw new AppError('Produto não encontrado', 404)
    res.json({ message: 'Produto removido' })
  } catch (err) { next(err) }
})

// ==========================================================================
// CATEGORIAS  /api/categorias
// ==========================================================================
const categoriaSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
})

app.get('/api/categorias', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const categorias = await prisma.categoria.findMany({ where: { empresaId: req.empresaId }, include: { _count: { select: { produtos: true } } }, orderBy: { nome: 'asc' } })
    res.json(categorias.map(c => ({ ...c, produtosCount: c._count.produtos, _count: undefined })))
  } catch (err) { next(err) }
})

app.post('/api/categorias', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = categoriaSchema.parse(req.body)
    const existing = await prisma.categoria.findFirst({ where: { empresaId: req.empresaId, nome: data.nome } })
    if (existing) throw new AppError('Categoria já existe', 409)
    const categoria = await prisma.categoria.create({ data: { ...data, empresaId: req.empresaId! } })
    res.status(201).json(categoria)
  } catch (err) { next(err) }
})

app.put('/api/categorias/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = categoriaSchema.partial().parse(req.body)
    const categoria = await prisma.categoria.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data })
    if (categoria.count === 0) throw new AppError('Categoria não encontrada', 404)
    res.json({ message: 'Categoria atualizada' })
  } catch (err) { next(err) }
})

app.delete('/api/categorias/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await prisma.categoria.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data: { ativo: false } })
    res.json({ message: 'Categoria desativada' })
  } catch (err) { next(err) }
})

// ==========================================================================
// FORNECEDORES  /api/fornecedores
// ==========================================================================
const fornecedorSchema = z.object({
  razaoSocial: z.string().min(2),
  nomeFantasia: z.string().optional().default(''),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  endereco: z.string().optional(),
  ativo: z.boolean().optional(),
})

app.get('/api/fornecedores', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (search) where.OR = [{ razaoSocial: { contains: search } }, { cnpj: { contains: search } }]
    const fornecedores = await prisma.fornecedor.findMany({ where, orderBy: { razaoSocial: 'asc' } })
    res.json(fornecedores)
  } catch (err) { next(err) }
})

app.post('/api/fornecedores', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = fornecedorSchema.parse(req.body)
    const fornecedor = await prisma.fornecedor.create({ data: { ...data, nomeFantasia: data.nomeFantasia || '', empresaId: req.empresaId! } })
    res.status(201).json(fornecedor)
  } catch (err) { next(err) }
})

app.put('/api/fornecedores/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = fornecedorSchema.partial().parse(req.body)
    const fornecedor = await prisma.fornecedor.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data })
    if (fornecedor.count === 0) throw new AppError('Fornecedor não encontrado', 404)
    res.json({ message: 'Fornecedor atualizado' })
  } catch (err) { next(err) }
})

app.delete('/api/fornecedores/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await prisma.fornecedor.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data: { ativo: false } })
    res.json({ message: 'Fornecedor desativado' })
  } catch (err) { next(err) }
})

// ==========================================================================
// VENDAS  /api/vendas
// ==========================================================================
const vendaItemSchema = z.object({
  produtoId: z.number().optional().nullable(),
  produtoNome: z.string(),
  quantidade: z.number().min(1),
  precoUnitario: z.number(),
  total: z.number(),
})
const vendaSchema = z.object({
  clienteId: z.number().optional().nullable(),
  vendedorId: z.number().optional().nullable(),
  total: z.number(),
  desconto: z.number().optional(),
  formaPagamento: z.string(),
  parcelas: z.number().optional(),
  status: z.string().optional(),
  data: z.string().optional(),
  itens: z.array(vendaItemSchema).min(1),
})

app.get('/api/vendas', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const start = req.query.start as string | undefined
    const end = req.query.end as string | undefined
    const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (start && end) where.data = { gte: new Date(start), lte: new Date(end) }
    if (status) where.status = status
    const vendas = await prisma.venda.findMany({ where, include: { itens: true }, orderBy: { data: 'desc' } })
    res.json(vendas)
  } catch (err) { next(err) }
})

app.get('/api/vendas/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const venda = await prisma.venda.findFirst({ where: { id: Number(req.params.id), empresaId: req.empresaId }, include: { itens: true } })
    if (!venda) throw new AppError('Venda não encontrada', 404)
    res.json(venda)
  } catch (err) { next(err) }
})

app.post('/api/vendas', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = vendaSchema.parse(req.body)
    const venda = await prisma.venda.create({
      data: {
        empresaId: req.empresaId!,
        clienteId: data.clienteId,
        vendedorId: data.vendedorId,
        total: data.total,
        desconto: data.desconto || 0,
        formaPagamento: data.formaPagamento,
        parcelas: data.parcelas || 1,
        status: data.status || 'concluida',
        data: data.data ? new Date(data.data) : new Date(),
        itens: { create: data.itens },
      },
      include: { itens: true },
    })
    for (const item of data.itens) {
      if (item.produtoId) {
        await prisma.produto.update({ where: { id: item.produtoId }, data: { quantidade: { decrement: item.quantidade } } })
        await prisma.movimentacaoEstoque.create({ data: { empresaId: req.empresaId!, produtoId: item.produtoId, tipo: 'saida', quantidade: item.quantidade, observacao: `Venda #${venda.id}`, responsavel: 'Sistema' } })
      }
    }
    res.status(201).json(venda)
  } catch (err) { next(err) }
})

app.put('/api/vendas/:id/cancel', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const venda = await prisma.venda.findFirst({ where: { id: Number(req.params.id), empresaId: req.empresaId }, include: { itens: true } })
    if (!venda) throw new AppError('Venda não encontrada', 404)
    await prisma.venda.update({ where: { id: venda.id }, data: { status: 'cancelada' } })
    for (const item of venda.itens) {
      if (item.produtoId) {
        await prisma.produto.update({ where: { id: item.produtoId }, data: { quantidade: { increment: item.quantidade } } })
      }
    }
    res.json({ message: 'Venda cancelada' })
  } catch (err) { next(err) }
})

// ==========================================================================
// ORDENS DE SERVICO  /api/ordens-servico
// ==========================================================================
const osServicoSchema = z.object({ descricao: z.string(), valor: z.number() })
const osProdutoSchema = z.object({ nome: z.string(), quantidade: z.number(), valor: z.number() })
const osSchema = z.object({
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
  servicos: z.array(osServicoSchema).optional(),
  produtosOS: z.array(osProdutoSchema).optional(),
})

app.get('/api/ordens-servico', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (status) where.status = status
    const ordens = await prisma.ordemServico.findMany({ where, include: { servicos: true, produtosOS: true, cliente: { select: { id: true, nome: true } } } as any, orderBy: { createdAt: 'desc' } })
    res.json(ordens)
  } catch (err) { next(err) }
})

app.get('/api/ordens-servico/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const os = await prisma.ordemServico.findFirst({ where: { id: Number(req.params.id), empresaId: req.empresaId }, include: { servicos: true, produtosOS: true, cliente: { select: { nome: true } } } as any })
    if (!os) throw new AppError('Ordem de serviço não encontrada', 404)
    res.json(os)
  } catch (err) { next(err) }
})

app.post('/api/ordens-servico', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = osSchema.parse(req.body)
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
  } catch (err) { next(err) }
})

app.put('/api/ordens-servico/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = osSchema.partial().parse(req.body)
    const campos = ['clienteId', 'veiculoId', 'numero', 'responsavel', 'observacoes', 'valorMaoObra', 'valorProdutos', 'desconto', 'status']
    const setData: any = {}
    for (const key of campos) { if (key in data) setData[key] = (data as any)[key] }
    if ('valorMaoObra' in data || 'valorProdutos' in data || 'desconto' in data) {
      const current = await prisma.ordemServico.findFirst({ where: { id: Number(req.params.id) } })
      if (current) setData.valorFinal = (setData.valorMaoObra ?? current.valorMaoObra) + (setData.valorProdutos ?? current.valorProdutos) - (setData.desconto ?? current.desconto)
    }
    if (data.servicos) { await prisma.oSServico.deleteMany({ where: { osId: Number(req.params.id) } }); setData.servicos = { create: data.servicos } }
    if (data.produtosOS) { await (prisma as any).oSProduto.deleteMany({ where: { osId: Number(req.params.id) } }); setData.produtosOS = { create: data.produtosOS } }
    const os = await prisma.ordemServico.update({ where: { id: Number(req.params.id) }, data: setData, include: { servicos: true, produtosOS: true } as any })
    res.json(os)
  } catch (err) { next(err) }
})

// ==========================================================================
// FINANCEIRO  /api/financeiro
// ==========================================================================
const receberSchema = z.object({
  cliente: z.string(),
  descricao: z.string(),
  valor: z.number(),
  vencimento: z.string(),
  status: z.string().optional(),
})
const pagarSchema = z.object({
  fornecedor: z.string(),
  descricao: z.string(),
  valor: z.number(),
  vencimento: z.string(),
  status: z.string().optional(),
})

app.get('/api/financeiro/receber', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const start = req.query.start as string | undefined
    const end = req.query.end as string | undefined
    const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (start && end) where.vencimento = { gte: new Date(start), lte: new Date(end) }
    if (status) where.status = status
    const contas = await prisma.contaReceber.findMany({ where, orderBy: { vencimento: 'asc' } })
    res.json(contas)
  } catch (err) { next(err) }
})

app.post('/api/financeiro/receber', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = receberSchema.parse(req.body)
    const conta = await prisma.contaReceber.create({ data: { ...data, vencimento: new Date(data.vencimento), empresaId: req.empresaId! } })
    res.status(201).json(conta)
  } catch (err) { next(err) }
})

app.put('/api/financeiro/receber/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = receberSchema.partial().parse(req.body)
    const updateData: any = { ...data }
    if (data.vencimento) updateData.vencimento = new Date(data.vencimento)
    const conta = await prisma.contaReceber.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data: updateData })
    if (conta.count === 0) throw new AppError('Conta não encontrada', 404)
    res.json({ message: 'Conta atualizada' })
  } catch (err) { next(err) }
})

app.get('/api/financeiro/pagar', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const start = req.query.start as string | undefined
    const end = req.query.end as string | undefined
    const status = req.query.status as string | undefined
    const where: any = { empresaId: req.empresaId }
    if (start && end) where.vencimento = { gte: new Date(start), lte: new Date(end) }
    if (status) where.status = status
    const contas = await prisma.contaPagar.findMany({ where, orderBy: { vencimento: 'asc' } })
    res.json(contas)
  } catch (err) { next(err) }
})

app.post('/api/financeiro/pagar', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = pagarSchema.parse(req.body)
    const conta = await prisma.contaPagar.create({ data: { ...data, vencimento: new Date(data.vencimento), empresaId: req.empresaId! } })
    res.status(201).json(conta)
  } catch (err) { next(err) }
})

app.put('/api/financeiro/pagar/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = pagarSchema.partial().parse(req.body)
    const updateData: any = { ...data }
    if (data.vencimento) updateData.vencimento = new Date(data.vencimento)
    const conta = await prisma.contaPagar.updateMany({ where: { id: Number(req.params.id), empresaId: req.empresaId }, data: updateData })
    if (conta.count === 0) throw new AppError('Conta não encontrada', 404)
    res.json({ message: 'Conta atualizada' })
  } catch (err) { next(err) }
})

app.get('/api/financeiro/resumo', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const [totalReceber, totalPagar, vendas, contasRec, contasPag] = await Promise.all([
      prisma.contaReceber.aggregate({ where: { empresaId: req.empresaId }, _sum: { valor: true } }),
      prisma.contaPagar.aggregate({ where: { empresaId: req.empresaId }, _sum: { valor: true } }),
      prisma.venda.aggregate({ where: { empresaId: req.empresaId, status: 'concluida' }, _sum: { total: true } }),
      prisma.contaReceber.findMany({ where: { empresaId: req.empresaId, status: 'pendente' }, orderBy: { vencimento: 'asc' }, take: 10 }),
      prisma.contaPagar.findMany({ where: { empresaId: req.empresaId, status: 'pendente' }, orderBy: { vencimento: 'asc' }, take: 10 }),
    ])
    res.json({
      receitaTotal: (vendas._sum.total || 0) + (totalReceber._sum.valor || 0),
      despesaTotal: totalPagar._sum.valor || 0,
      saldo: (vendas._sum.total || 0) + (totalReceber._sum.valor || 0) - (totalPagar._sum.valor || 0),
      contasReceber: contasRec,
      contasPagar: contasPag,
    })
  } catch (err) { next(err) }
})

// ==========================================================================
// ESTOQUE  /api/estoque
// ==========================================================================
const estoqueSchema = z.object({
  tipo: z.enum(['entrada', 'saida', 'ajuste']),
  produtoId: z.number(),
  quantidade: z.number(),
  observacao: z.string().optional(),
  responsavel: z.string().optional(),
})

app.get('/api/estoque', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { start, end, tipo, produtoId } = req.query
    const where: any = { empresaId: req.empresaId }
    if (start && end) where.data = { gte: new Date(start as string), lte: new Date(end as string) }
    if (tipo) where.tipo = tipo
    if (produtoId) where.produtoId = parseInt(produtoId as string)
    const mov = await prisma.movimentacaoEstoque.findMany({ where, include: { produto: { select: { id: true, nome: true } } }, orderBy: { data: 'desc' } })
    res.json(mov)
  } catch (err) { next(err) }
})

app.post('/api/estoque', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = estoqueSchema.parse(req.body)
    const produto = await prisma.produto.findFirst({ where: { id: data.produtoId, empresaId: req.empresaId } })
    if (!produto) throw new AppError('Produto não encontrado', 404)
    const mov = await prisma.movimentacaoEstoque.create({ data: { ...data, empresaId: req.empresaId! } })
    if (data.tipo === 'entrada') await prisma.produto.update({ where: { id: data.produtoId }, data: { quantidade: { increment: data.quantidade } } })
    else if (data.tipo === 'saida') {
      if (produto.quantidade < data.quantidade) throw new AppError('Estoque insuficiente', 400)
      await prisma.produto.update({ where: { id: data.produtoId }, data: { quantidade: { decrement: data.quantidade } } })
    } else await prisma.produto.update({ where: { id: data.produtoId }, data: { quantidade: data.quantidade } })
    res.status(201).json(mov)
  } catch (err) { next(err) }
})

app.get('/api/estoque/estoque-geral', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const produtos = await prisma.produto.findMany({ where: { empresaId: req.empresaId }, include: { categoria: { select: { nome: true } } }, orderBy: { nome: 'asc' } })
    res.json(produtos)
  } catch (err) { next(err) }
})

// ==========================================================================
// DASHBOARD  /api/dashboard
// ==========================================================================
app.get('/api/dashboard', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const empresaId = req.empresaId!
    const [totalVendas, totalProdutos, totalClientes, totalOrdens, vendasMes, vendasRecentes, produtosBaixoEstoque, ordensPendentes, faturasPendentes] = await Promise.all([
      prisma.venda.count({ where: { empresaId, status: 'concluida' } }),
      prisma.produto.count({ where: { empresaId, status: true } }),
      prisma.cliente.count({ where: { empresaId } }),
      prisma.ordemServico.count({ where: { empresaId } }),
      prisma.venda.aggregate({ where: { empresaId, status: 'concluida', data: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { total: true } }),
      prisma.venda.findMany({ where: { empresaId }, include: { itens: true }, orderBy: { data: 'desc' }, take: 10 }),
      prisma.produto.count({ where: { empresaId, status: true, quantidade: { lte: 0 } } }),
      prisma.ordemServico.count({ where: { empresaId, status: { in: ['aberta', 'andamento'] } } }),
      prisma.contaReceber.count({ where: { empresaId, status: 'pendente', vencimento: { lte: new Date() } } }),
    ])
    const vendasPorDia = await prisma.venda.groupBy({ by: ['data'], where: { empresaId, status: 'concluida' }, _sum: { total: true }, _count: true, orderBy: { data: 'asc' } })
    res.json({
      kpis: { totalVendas, receitaMes: vendasMes._sum.total || 0, totalProdutos, totalClientes, totalOrdens, produtosBaixoEstoque, ordensPendentes, faturasPendentes },
      vendasRecentes,
      vendasPorDia: vendasPorDia.map(v => ({ data: v.data.toISOString().split('T')[0], total: v._sum.total || 0, quantidade: v._count })),
    })
  } catch (err) { next(err) }
})

// ==========================================================================
// COMPRAS  /api/compras
// ==========================================================================
const compraSchema = z.object({
  numeroNfe: z.string().optional(),
  fornecedor: z.string(),
  data: z.string().optional(),
  valor: z.number(),
  quantidadeProdutos: z.number().optional(),
})

app.get('/api/compras', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const compras = await prisma.compra.findMany({ where: { empresaId: req.empresaId }, orderBy: { data: 'desc' } })
    res.json(compras)
  } catch (err) { next(err) }
})

app.post('/api/compras', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = compraSchema.parse(req.body)
    const compra = await prisma.compra.create({ data: { ...data, data: data.data ? new Date(data.data) : new Date(), empresaId: req.empresaId! } })
    res.status(201).json(compra)
  } catch (err) { next(err) }
})

app.delete('/api/compras/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await prisma.compra.deleteMany({ where: { id: Number(req.params.id), empresaId: req.empresaId } })
    res.json({ message: 'Compra removida' })
  } catch (err) { next(err) }
})

// ==========================================================================
// NOTAS FISCAIS  /api/notas-fiscais
// ==========================================================================
const notaFiscalSchema = z.object({
  numero: z.string(),
  fornecedor: z.string(),
  cnpj: z.string().optional(),
  dataEmissao: z.string(),
  valorTotal: z.number(),
  parcelas: z.number().optional(),
})

app.get('/api/notas-fiscais', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const notas = await prisma.notaFiscal.findMany({ where: { empresaId: req.empresaId }, orderBy: { createdAt: 'desc' } })
    res.json(notas)
  } catch (err) { next(err) }
})

app.post('/api/notas-fiscais', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const data = notaFiscalSchema.parse(req.body)
    const nota = await prisma.notaFiscal.create({ data: { ...data, dataEmissao: new Date(data.dataEmissao), empresaId: req.empresaId! } })
    res.status(201).json(nota)
  } catch (err) { next(err) }
})

app.delete('/api/notas-fiscais/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await prisma.notaFiscal.deleteMany({ where: { id: Number(req.params.id), empresaId: req.empresaId } })
    res.json({ message: 'Nota removida' })
  } catch (err) { next(err) }
})

// ==========================================================================
// ASSINATURAS  /api/assinaturas
// ==========================================================================
const PLANOS: Record<string, { nome: string; preco: number; limites: { usuarios: number; produtos: number; clientes: number } }> = {
  basic: { nome: 'Basic', preco: 49.90, limites: { usuarios: 2, produtos: 100, clientes: 50 } },
  medium: { nome: 'Medium', preco: 99.90, limites: { usuarios: 5, produtos: 500, clientes: 200 } },
  pro: { nome: 'Pro', preco: 199.90, limites: { usuarios: 999, produtos: 9999, clientes: 9999 } },
}

app.get('/api/assinaturas/planos', (_req, res) => { res.json(PLANOS) })

app.get('/api/assinaturas/minha', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: req.empresaId }, select: { planoId: true, assinaturaStatus: true, dataVencimento: true } })
    if (!empresa) throw new AppError('Empresa não encontrada', 404)
    const plano = PLANOS[empresa.planoId] || PLANOS.basic
    res.json({ ...empresa, plano: { ...plano, id: empresa.planoId }, diasTeste: empresa.dataVencimento ? Math.max(0, Math.ceil((new Date(empresa.dataVencimento).getTime() - Date.now()) / 86400000)) : 0 })
  } catch (err) { next(err) }
})

app.put('/api/assinaturas/upgrade', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { planoId } = req.body
    if (!['basic', 'medium', 'pro'].includes(planoId)) throw new AppError('Plano inválido', 400)
    await prisma.empresa.update({ where: { id: req.empresaId }, data: { planoId, assinaturaStatus: 'ativo', dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
    res.json({ message: `Plano alterado para ${PLANOS[planoId].nome}` })
  } catch (err) { next(err) }
})

app.get('/api/assinaturas/status', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: req.empresaId }, select: { planoId: true, assinaturaStatus: true, dataVencimento: true, _count: { select: { users: true, produtos: true, clientes: true } } } })
    if (!empresa) throw new AppError('Empresa não encontrada', 404)
    const plano = PLANOS[empresa.planoId] || PLANOS.basic
    const bloqueado = empresa.assinaturaStatus === 'vencida' || (empresa.assinaturaStatus === 'teste' && empresa.dataVencimento && new Date(empresa.dataVencimento) < new Date())
    res.json({ planoId: empresa.planoId, assinaturaStatus: empresa.assinaturaStatus, dataVencimento: empresa.dataVencimento, limites: plano.limites, usados: { usuarios: empresa._count.users, produtos: empresa._count.produtos, clientes: empresa._count.clientes }, bloqueado })
  } catch (err) { next(err) }
})

// ==========================================================================
// Error Handler
// ==========================================================================
app.use(express.static('../dist'))

const SPA_PATH = /^\/(?!api\/)/
app.get(SPA_PATH, (_req, res) => {
  res.sendFile('index.html', { root: '../dist' })
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err?.name, err?.message)
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message })
  if (err?.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos', details: err.issues })
  if (err?.name?.startsWith('Prisma')) return res.status(503).json({ error: 'Banco de dados indisponível' })
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(PORT, () => {
  console.log(`AutoTech API on :${PORT}`)
})
