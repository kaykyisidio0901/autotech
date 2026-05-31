import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/ping', (_req, res) => { res.json({ ok: true }) })
app.get('/api/health', (_req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }) })
app.post('/api/echo', (req, res) => { res.json({ received: req.body }) })

app.all('*', (req, res) => {
  res.json({ path: req.path, method: req.method, query: req.query })
})

const port = parseInt(process.env.PORT || '3001')
app.listen(port, () => {
  console.log(`✅ Minimal tsx server on :${port}`)
})
