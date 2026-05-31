import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR]', err.name, err.message)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Dados inválidos', details: (err as any).issues })
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ error: 'Erro no banco de dados', details: err.message })
  }

  if (err.name === 'PrismaClientInitializationError') {
    return res.status(503).json({ error: 'Banco de dados indisponível', details: err.message })
  }

  return res.status(500).json({ error: 'Erro interno do servidor', details: err.message })
}
