import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../database/prisma'
import { env } from '../../config/env'
import { AppError } from '../../errors/AppError'

export async function login(email: string, senha: string) {
  const user = await prisma.user.findFirst({ where: { email, ativo: true } })
  if (!user) throw new AppError('Credenciais inválidas', 401)

  const valid = await bcrypt.compare(senha, user.senha)
  if (!valid) throw new AppError('Credenciais inválidas', 401)

  const empresa = await prisma.empresa.findUnique({ where: { id: user.empresaId } })
  if (!empresa) throw new AppError('Empresa não encontrada', 404)

  const token = jwt.sign(
    { userId: user.id, empresaId: user.empresaId, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions,
  )

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    },
    empresa: {
      id: empresa.id,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      planoId: empresa.planoId,
      assinaturaStatus: empresa.assinaturaStatus,
    },
  }
}

export async function register(
  nome: string,
  email: string,
  senha: string,
  razaoSocial: string,
  cnpj: string,
) {
  const existing = await prisma.empresa.findUnique({ where: { cnpj } })
  if (existing) throw new AppError('CNPJ já cadastrado', 409)

  const emailExists = await prisma.user.findFirst({ where: { email } })
  if (emailExists) throw new AppError('Email já cadastrado', 409)

  const senhaHash = await bcrypt.hash(senha, 10)

  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial,
      nomeFantasia: razaoSocial,
      cnpj,
      assinaturaStatus: 'teste',
      planoId: 'pro',
      dataVencimento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      users: {
        create: {
          nome,
          email,
          senha: senhaHash,
          role: 'admin',
        },
      },
    },
    include: { users: true },
  })

  const token = jwt.sign(
    { userId: empresa.users[0].id, empresaId: empresa.id, role: 'admin' },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions,
  )

  return {
    token,
    user: {
      id: empresa.users[0].id,
      nome: empresa.users[0].nome,
      email: empresa.users[0].email,
      role: empresa.users[0].role,
    },
    empresa: {
      id: empresa.id,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      planoId: empresa.planoId,
      assinaturaStatus: empresa.assinaturaStatus,
    },
  }
}

export async function me(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { empresa: true },
  })
  if (!user) throw new AppError('Usuário não encontrado', 404)

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    empresa: {
      id: user.empresa.id,
      razaoSocial: user.empresa.razaoSocial,
      nomeFantasia: user.empresa.nomeFantasia,
      planoId: user.empresa.planoId,
      assinaturaStatus: user.empresa.assinaturaStatus,
    },
  }
}
