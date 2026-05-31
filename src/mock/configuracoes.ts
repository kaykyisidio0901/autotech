import type {
  DadosEmpresa, IdentidadeVisual, DadosFiscais, ComissaoConfig,
  OficinaConfig, ImpressaoConfig, MensagemWhatsApp, BackupConfig,
  DashboardWidget, LicencaInfo,
} from '../types'

export const mockDadosEmpresa: DadosEmpresa = {
  razaoSocial: 'AutoTech Manager Ltda',
  nomeFantasia: 'AutoTech Manager',
  cnpj: '12.345.678/0001-90',
  ie: '123.456.789.100',
  telefone: '(11) 4000-0000',
  whatsapp: '5511940000000',
  email: 'contato@autotech.com.br',
  site: 'www.autotech.com.br',
  cep: '01310-000',
  endereco: 'Av. Paulista',
  numero: '1000',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
  logo: null,
  logoReduzida: null,
  favicon: null,
}

export const mockIdentidadeVisual: IdentidadeVisual = {
  corPrincipal: '#10b981',
  corSecundaria: '#0d9488',
  corBotoes: '#10b981',
  corMenus: '#1e293b',
  corCards: '#1e293b',
  tema: 'escuro',
}

export const mockDadosFiscais: DadosFiscais = {
  regimeTributario: 'Simples Nacional',
  cnae: '45.30-7-03',
  inscricaoMunicipal: '123456',
  serieNotaFiscal: '1',
  ambienteFiscal: 'homologacao',
}

export const mockComissoes: ComissaoConfig[] = [
  { funcionarioId: 2, nome: 'João Silva', percentual: 3, tipo: 'venda' },
  { funcionarioId: 3, nome: 'Maria Souza', percentual: 4, tipo: 'servico' },
  { funcionarioId: 5, nome: 'Ana Oliveira', percentual: 2.5, tipo: 'venda' },
  { funcionarioId: 6, nome: 'Lucas Costa', percentual: 3.5, tipo: 'categoria', categoriaAlvo: 'Multimídia' },
]

export const mockOficinaConfig: OficinaConfig = {
  tempoMedioServicos: 60,
  garantiaPadrao: 90,
  mensagemPadraoOS: 'Serviço realizado conforme solicitação do cliente.',
  observacoesAutomaticas: 'Verificar condições gerais do veículo antes da entrega.',
  tecnicos: ['João Silva', 'Maria Souza', 'Lucas Costa'],
}

export const mockImpressaoConfig: ImpressaoConfig = {
  cabecalho: 'AutoTech Manager - Soluções em Áudio Automotivo',
  rodape: 'Obrigado pela confiança! AutoTech Manager - CNPJ: 12.345.678/0001-90',
  aplicarEm: { os: true, orcamentos: true, relatorios: true, comprovantes: true },
}

export const mockMensagensWhatsApp: MensagemWhatsApp[] = [
  {
    tipo: 'boas_vindas',
    titulo: 'Boas-vindas',
    mensagem: 'Olá {cliente}, seja bem-vindo à AutoTech Manager! Agradecemos pela preferência. Estamos à disposição para qualquer dúvida.',
  },
  {
    tipo: 'orcamento_aprovado',
    titulo: 'Orçamento Aprovado',
    mensagem: 'Olá {cliente}, seu orçamento no valor de {valor} foi aprovado! Iniciaremos o serviço em breve. Acompanhe pelo nosso sistema.',
  },
  {
    tipo: 'servico_concluido',
    titulo: 'Serviço Concluído',
    mensagem: 'Olá {cliente}, o serviço do veículo {placa} foi concluído! Seu veículo já está pronto para retirada. Valor final: {valor}.',
  },
  {
    tipo: 'cobranca',
    titulo: 'Cobrança',
    mensagem: 'Olá {cliente}, informamos que sua conta no valor de {valor} com vencimento em {vencimento} está pendente. Regularize para evitar juros.',
  },
]

export const mockBackupConfig: BackupConfig = {
  frequencia: 'diario',
  ultimoBackup: '2026-05-29 23:30',
  tamanho: '45.2 MB',
  ativo: true,
}

export const mockDashboardWidgets: DashboardWidget[] = [
  { id: 'vendas_dia', label: 'Vendas do Dia', ativo: true },
  { id: 'vendas_mes', label: 'Vendas do Mês', ativo: true },
  { id: 'estoque', label: 'Produtos em Estoque', ativo: true },
  { id: 'financeiro', label: 'Financeiro', ativo: true },
  { id: 'ordens_servico', label: 'Ordens de Serviço', ativo: true },
  { id: 'clientes', label: 'Clientes Ativos', ativo: true },
  { id: 'mais_vendidos', label: 'Produtos Mais Vendidos', ativo: false },
  { id: 'vendas_semana', label: 'Gráfico Vendas Semana', ativo: true },
]

export const mockLicencaInfo: LicencaInfo = {
  plano: 'Premium Anual',
  dataVencimento: '2027-05-28',
  status: 'ativa',
  historicoPagamentos: [
    { data: '2026-05-28', valor: 2990, status: 'pago' },
    { data: '2025-05-28', valor: 2490, status: 'pago' },
    { data: '2024-05-28', valor: 1990, status: 'pago' },
  ],
}

export const estadosBr = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export const regimesTributarios = [
  'Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'MEI',
]
