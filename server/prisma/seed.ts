import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const senha = await bcrypt.hash('admin123', 10)

  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: 'AutoTech Sistemas Ltda',
      nomeFantasia: 'AutoTech Manager',
      cnpj: '11222333000181',
      ie: '123456789',
      telefone: '(11) 99999-8888',
      whatsapp: '(11) 99999-8888',
      email: 'contato@autotech.com.br',
      cep: '01001-000',
      endereco: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      planoId: 'pro',
      assinaturaStatus: 'teste',
      dataVencimento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  })

  const admin = await prisma.user.create({
    data: {
      empresaId: empresa.id,
      nome: 'Administrador',
      email: 'admin@autotech.com.br',
      senha,
      role: 'admin',
    },
  })

  await prisma.user.createMany({
    data: [
      { empresaId: empresa.id, nome: 'Carlos Vendedor', email: 'carlos@autotech.com.br', senha, role: 'funcionario' },
      { empresaId: empresa.id, nome: 'Maria Gerente', email: 'maria@autotech.com.br', senha, role: 'gerente' },
    ],
  })

  const catSom = await prisma.categoria.create({ data: { empresaId: empresa.id, nome: 'Som', descricao: 'Aparelhos de som automotivo' } })
  const catAcessorio = await prisma.categoria.create({ data: { empresaId: empresa.id, nome: 'Acessório', descricao: 'Acessórios em geral' } })
  const catInstalacao = await prisma.categoria.create({ data: { empresaId: empresa.id, nome: 'Instalação', descricao: 'Serviços de instalação' } })
  const catIluminacao = await prisma.categoria.create({ data: { empresaId: empresa.id, nome: 'Iluminação', descricao: 'Iluminação automotiva' } })
  const catPelicula = await prisma.categoria.create({ data: { empresaId: empresa.id, nome: 'Película', descricao: 'Películas automotivas' } })

  const fornecedor1 = await prisma.fornecedor.create({
    data: { empresaId: empresa.id, razaoSocial: 'Pioneer do Brasil Ltda', nomeFantasia: 'Pioneer', cnpj: '99888777000155', telefone: '(11) 3333-4444' },
  })
  const fornecedor2 = await prisma.fornecedor.create({
    data: { empresaId: empresa.id, razaoSocial: 'JBL Distribuidora', nomeFantasia: 'JBL', cnpj: '77666555000199', telefone: '(11) 2222-3333' },
  })

  await prisma.produto.createMany({
    data: [
      { empresaId: empresa.id, categoriaId: catSom.id, fornecedorId: fornecedor1.id, codigoInterno: 'PIO-001', nome: 'CD Player Pioneer DEH-1700', marca: 'Pioneer', precoCusto: 250, precoVenda: 499, quantidade: 15, estoqueMinimo: 3, status: true },
      { empresaId: empresa.id, categoriaId: catSom.id, fornecedorId: fornecedor1.id, codigoInterno: 'PIO-002', nome: 'DVD Pioneer AVH-290BT', marca: 'Pioneer', precoCusto: 600, precoVenda: 1299, quantidade: 8, estoqueMinimo: 2, status: true },
      { empresaId: empresa.id, categoriaId: catSom.id, fornecedorId: fornecedor2.id, codigoInterno: 'JBL-001', nome: 'Subwoofer JBL GTX1200', marca: 'JBL', precoCusto: 350, precoVenda: 799, quantidade: 0, estoqueMinimo: 2, status: true },
      { empresaId: empresa.id, categoriaId: catSom.id, fornecedorId: fornecedor2.id, codigoInterno: 'JBL-002', nome: 'Kit 2 vias JBL GT7-6', marca: 'JBL', precoCusto: 180, precoVenda: 399, quantidade: 20, estoqueMinimo: 5, status: true },
      { empresaId: empresa.id, categoriaId: catAcessorio.id, codigoInterno: 'ACC-001', nome: 'Carregador Veicular USB-C', marca: 'Multilaser', precoCusto: 15, precoVenda: 39.90, quantidade: 50, estoqueMinimo: 10, status: true },
      { empresaId: empresa.id, categoriaId: catAcessorio.id, codigoInterno: 'ACC-002', nome: 'Suporte de Celular para Carro', marca: 'Multilaser', precoCusto: 20, precoVenda: 49.90, quantidade: 30, estoqueMinimo: 5, status: true },
      { empresaId: empresa.id, categoriaId: catIluminacao.id, codigoInterno: 'ILL-001', nome: 'Fita LED RGB 60cm', marca: 'LEDLight', precoCusto: 25, precoVenda: 59.90, quantidade: 40, estoqueMinimo: 10, status: true },
      { empresaId: empresa.id, categoriaId: catIluminacao.id, codigoInterno: 'ILL-002', nome: 'Farol de Milha LED', marca: 'LEDLight', precoCusto: 80, precoVenda: 199, quantidade: 12, estoqueMinimo: 3, status: true },
      { empresaId: empresa.id, categoriaId: catPelicula.id, codigoInterno: 'PEL-001', nome: 'Película Insulfilm G5', marca: 'Insulfilm', precoCusto: 30, precoVenda: 89.90, quantidade: 25, estoqueMinimo: 5, status: true },
      { empresaId: empresa.id, categoriaId: catPelicula.id, codigoInterno: 'PEL-002', nome: 'Película Insulfilm G2', marca: 'Insulfilm', precoCusto: 25, precoVenda: 69.90, quantidade: 20, estoqueMinimo: 5, status: true },
      { empresaId: empresa.id, categoriaId: catInstalacao.id, codigoInterno: 'SVC-001', nome: 'Instalação Completa de Som', marca: 'AutoTech', precoCusto: 50, precoVenda: 199, quantidade: 999, estoqueMinimo: 0, status: true },
      { empresaId: empresa.id, categoriaId: catInstalacao.id, codigoInterno: 'SVC-002', nome: 'Aplicação de Película (por porta)', marca: 'AutoTech', precoCusto: 20, precoVenda: 79.90, quantidade: 999, estoqueMinimo: 0, status: true },
    ],
  })

  const cli1 = await prisma.cliente.create({
    data: {
      empresaId: empresa.id, nome: 'João Silva', cpf: '12345678901', telefone: '(11) 91234-5678',
      whatsapp: '(11) 91234-5678', email: 'joao@email.com', cidade: 'São Paulo', estado: 'SP',
    },
  })
  const cli2 = await prisma.cliente.create({
    data: {
      empresaId: empresa.id, nome: 'Maria Oliveira', cpf: '98765432101', telefone: '(11) 98765-4321',
      whatsapp: '(11) 98765-4321', email: 'maria@email.com', cidade: 'São Paulo', estado: 'SP',
    },
  })
  const cli3 = await prisma.cliente.create({
    data: {
      empresaId: empresa.id, nome: 'Pedro Santos', cpf: '45678912301', telefone: '(11) 95555-4444',
      email: 'pedro@email.com', cidade: 'Guarulhos', estado: 'SP',
    },
  })

  await prisma.veiculo.createMany({
    data: [
      { empresaId: empresa.id, clienteId: cli1.id, placa: 'ABC-1234', marca: 'Volkswagen', modelo: 'Gol', ano: 2020, cor: 'Preto', combustivel: 'Flex' },
      { empresaId: empresa.id, clienteId: cli1.id, placa: 'DEF-5678', marca: 'Fiat', modelo: 'Uno', ano: 2022, cor: 'Branco', combustivel: 'Flex' },
      { empresaId: empresa.id, clienteId: cli2.id, placa: 'GHI-9012', marca: 'Chevrolet', modelo: 'Onix', ano: 2021, cor: 'Prata', combustivel: 'Flex' },
      { empresaId: empresa.id, clienteId: cli3.id, placa: 'JKL-3456', marca: 'Hyundai', modelo: 'HB20', ano: 2023, cor: 'Azul', combustivel: 'Flex' },
    ],
  })

  await prisma.ordemServico.create({
    data: {
      empresaId: empresa.id, clienteId: cli1.id, numero: 'OS-001',
      responsavel: 'Carlos', valorMaoObra: 150, valorProdutos: 799, desconto: 0, valorFinal: 949,
      status: 'concluida',
      servicos: { create: { descricao: 'Instalação de som', valor: 150 } },
      produtosOS: { create: { nome: 'DVD Pioneer AVH-290BT', quantidade: 1, valor: 799 } },
    },
  })
  await prisma.ordemServico.create({
    data: {
      empresaId: empresa.id, clienteId: cli2.id, numero: 'OS-002',
      responsavel: 'Carlos', valorMaoObra: 50, valorProdutos: 89.90, desconto: 0, valorFinal: 139.90,
      status: 'andamento',
      servicos: { create: { descricao: 'Aplicação de película Insulfilm G5', valor: 50 } },
      produtosOS: { create: { nome: 'Película Insulfilm G5', quantidade: 1, valor: 89.90 } },
    },
  })
  await prisma.ordemServico.create({
    data: {
      empresaId: empresa.id, clienteId: cli3.id, numero: 'OS-003',
      responsavel: 'Carlos', valorMaoObra: 80, valorProdutos: 199, desconto: 0, valorFinal: 279,
      status: 'aberta',
      servicos: { create: { descricao: 'Instalação de farol de milha LED', valor: 80 } },
      produtosOS: { create: { nome: 'Farol de Milha LED', quantidade: 1, valor: 199 } },
    },
  })

  await prisma.venda.create({
    data: {
      empresaId: empresa.id, clienteId: cli1.id, total: 1797, desconto: 0, formaPagamento: 'credito', parcelas: 3, status: 'concluida',
      itens: {
        create: [
          { produtoNome: 'DVD Pioneer AVH-290BT', produtoId: 2, quantidade: 1, precoUnitario: 1299, total: 1299 },
          { produtoNome: 'Kit 2 vias JBL GT7-6', produtoId: 4, quantidade: 1, precoUnitario: 399, total: 399 },
          { produtoNome: 'Carregador Veicular USB-C', produtoId: 5, quantidade: 2, precoUnitario: 39.90, total: 79.80 },
        ],
      },
    },
  })
  await prisma.venda.create({
    data: {
      empresaId: empresa.id, clienteId: cli2.id, total: 59.90, desconto: 0, formaPagamento: 'debito', status: 'concluida',
      itens: { create: [{ produtoNome: 'Fita LED RGB 60cm', produtoId: 7, quantidade: 1, precoUnitario: 59.90, total: 59.90 }] },
    },
  })
  await prisma.venda.create({
    data: {
      empresaId: empresa.id, total: 49.90, desconto: 0, formaPagamento: 'pix', status: 'concluida',
      itens: { create: [{ produtoNome: 'Suporte de Celular para Carro', produtoId: 6, quantidade: 1, precoUnitario: 49.90, total: 49.90 }] },
    },
  })

  await prisma.contaReceber.createMany({
    data: [
      { empresaId: empresa.id, cliente: 'João Silva', descricao: 'Venda a prazo - DVD Pioneer', valor: 433, vencimento: new Date(Date.now() + 30 * 86400000), status: 'pendente' },
      { empresaId: empresa.id, cliente: 'Maria Oliveira', descricao: 'Serviço instalação som', valor: 199, vencimento: new Date(Date.now() + 15 * 86400000), status: 'pendente' },
    ],
  })

  await prisma.contaPagar.createMany({
    data: [
      { empresaId: empresa.id, fornecedor: 'Pioneer do Brasil Ltda', descricao: 'Nota fiscal 1234', valor: 2500, vencimento: new Date(Date.now() + 20 * 86400000), status: 'pendente' },
      { empresaId: empresa.id, fornecedor: 'JBL Distribuidora', descricao: 'Nota fiscal 5678', valor: 1800, vencimento: new Date(Date.now() + 10 * 86400000), status: 'pendente' },
    ],
  })

  console.log('✅ Seed executado com sucesso!')
  console.log(`📧 Email: admin@autotech.com.br`)
  console.log(`🔑 Senha: admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
