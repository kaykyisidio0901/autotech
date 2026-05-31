import app from './app'
import { env } from './config/env'

app.listen(env.port, () => {
  console.log(`🚀 AutoTech API rodando em http://localhost:${env.port}`)
  console.log(`📚 Swagger em http://localhost:${env.port}/api-docs`)
})
