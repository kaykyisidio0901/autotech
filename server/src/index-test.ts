import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/ping', (_req, res) => {
  res.json({ ok: true, time: Date.now() })
})

app.post('/api/test', (req, res) => {
  res.json({ body: req.body })
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const port = parseInt(process.env.PORT || '3001')
app.listen(port, () => {
  console.log(`✅ Minimal API on :${port}`)
})
