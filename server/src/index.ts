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

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(4),
})

app.get('/api/ping', (_req, res) => { res.json({ ok: true }) })
app.get('/api/health', (_req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }) })

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, senha } = loginSchema.parse(req.body)
    const user = await prisma.user.findFirst({ where: { email, ativo: true } })
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

    const valid = await bcrypt.compare(senha, user.senha)
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' })

    const empresa = await prisma.empresa.findUnique({ where: { id: user.empresaId } })
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' })

    const token = jwt.sign(
      { userId: user.id, empresaId: user.empresaId, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES } as jwt.SignOptions,
    )

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
      empresa: { id: empresa.id, razaoSocial: empresa.razaoSocial, nomeFantasia: empresa.nomeFantasia },
    })
  } catch (err) {
    next(err)
  }
})

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err?.name, err?.message)
  if (err?.name === 'ZodError') return res.status(400).json({ error: 'Dados inválidos', details: err.issues })
  if (err?.name?.startsWith('Prisma')) return res.status(503).json({ error: 'Banco de dados indisponível' })
  res.status(500).json({ error: 'Erro interno do servidor' })
})

app.listen(PORT, () => {
  console.log(`✅ AutoTech API on :${PORT}`)
})
