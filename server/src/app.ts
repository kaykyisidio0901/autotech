import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { errorHandler } from './middlewares/error'

import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import clientesRoutes from './modules/clientes/clientes.routes'
import veiculosRoutes from './modules/veiculos/veiculos.routes'
import produtosRoutes from './modules/produtos/produtos.routes'
import categoriasRoutes from './modules/categorias/categorias.routes'
import fornecedoresRoutes from './modules/fornecedores/fornecedores.routes'
import vendasRoutes from './modules/vendas/vendas.routes'
import ordensServicoRoutes from './modules/ordens-servico/ordens-servico.routes'
import financeiroRoutes from './modules/financeiro/financeiro.routes'
import estoqueRoutes from './modules/estoque/estoque.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'
import comprasRoutes from './modules/compras/compras.routes'
import notasFiscaisRoutes from './modules/notas-fiscais/notas-fiscais.routes'
import assinaturasRoutes from './modules/assinaturas/assinaturas.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/veiculos', veiculosRoutes)
app.use('/api/produtos', produtosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/fornecedores', fornecedoresRoutes)
app.use('/api/vendas', vendasRoutes)
app.use('/api/ordens-servico', ordensServicoRoutes)
app.use('/api/financeiro', financeiroRoutes)
app.use('/api/estoque', estoqueRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/compras', comprasRoutes)
app.use('/api/notas-fiscais', notasFiscaisRoutes)
app.use('/api/assinaturas', assinaturasRoutes)

app.get('/api/health', (_req, res) => {
  res.set('Content-Type', 'application/json')
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/ping', (_req, res) => {
  res.json({ pong: true })
})

app.use(errorHandler)

export default app
