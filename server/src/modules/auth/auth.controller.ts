import { Request, Response, NextFunction } from 'express'
import { loginSchema, registerSchema } from './auth.schema'
import * as authService from './auth.service'
import { AuthRequest } from '../../middlewares/auth'

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, senha } = loginSchema.parse(req.body)
    const result = await authService.login(email, senha)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body)
    const result = await authService.register(data.nome, data.email, data.senha, data.razaoSocial, data.cnpj)
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await authService.me(req.userId!)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
