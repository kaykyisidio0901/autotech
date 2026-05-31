import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
})

export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  razaoSocial: z.string().min(2, 'Razão social deve ter no mínimo 2 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
})
