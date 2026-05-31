import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { prisma } from '../database/prisma'

export interface AuthRequest extends Request {
  userId?: number
  empresaId?: number
  userRole?: string
}

interface JwtPayload {
  userId: number
  empresaId: number
  role: string
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return void _res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload
    req.userId = decoded.userId
    req.empresaId = decoded.empresaId
    req.userRole = decoded.role
    next()
  } catch {
    return void _res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return void _res.status(403).json({ error: 'Acesso não autorizado' })
    }
    next()
  }
}
