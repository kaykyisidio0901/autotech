export type UserRole = 'admin' | 'proprietario' | 'gerente' | 'funcionario'

export interface User {
  id: number
  nome: string
  email: string
  senha: string
  role: UserRole
  ativo: boolean
}

export interface SidebarLink {
  label: string
  path: string
  icon: string
}

export interface DashboardData {
  vendasDia: number
  vendasMes: number
  produtosEstoque: number
  ordensServico: number
  clientes: number
  vendasSemana: number[]
}

export type FormaPagamento = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto'
export type VendaStatus = 'concluida' | 'cancelada' | 'pendente'

export interface VendaItem {
  produto: string
  quantidade: number
  precoUnitario: number
}

export interface Venda {
  id: number
  cliente: string
  itens: VendaItem[]
  total: number
  desconto: number
  formaPagamento: FormaPagamento
  parcelas: number
  status: VendaStatus
  vendedor: string
  data: string
}

export interface Categoria {
  id: number
  nome: string
  descricao: string
  ativo: boolean
}

export interface Fornecedor {
  id: number
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  telefone: string
  whatsapp: string
  email: string
  endereco: string
  ativo: boolean
}

export type SituacaoEstoque = 'normal' | 'baixo' | 'critico' | 'sem_estoque'

export interface Produto {
  id: number
  codigoInterno: string
  codigoBarras: string
  nome: string
  categoria: string
  marca: string
  fornecedor: string
  descricao: string
  precoCusto: number
  precoVenda: number
  quantidade: number
  estoqueMinimo: number
  status: boolean
  imagem?: string
  imagens?: string[]
}

export type MovimentoTipo = 'entrada' | 'saida' | 'ajuste'

export interface MovimentacaoEstoque {
  id: number
  produtoId: number
  produtoNome: string
  tipo: MovimentoTipo
  quantidade: number
  data: string
  observacao: string
  responsavel: string
}

export interface Cliente {
  id: number
  nome: string
  cpf: string
  rg: string
  telefone: string
  whatsapp: string
  email: string
  cep: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
}

export interface Veiculo {
  id: number
  clienteId: number
  placa: string
  marca: string
  modelo: string
  ano: number
  cor: string
  chassi: string
  renavam: string
  combustivel: string
  quilometragem: number
}

export type OSStatus = 'aberta' | 'em_andamento' | 'aguardando_peca' | 'finalizada' | 'entregue'

export interface OSServico {
  descricao: string
  valor: number
}

export interface OSProduto {
  nome: string
  quantidade: number
  valor: number
}

export interface OrdemServico {
  id: number
  numero: string
  clienteId: number
  clienteNome: string
  veiculoId: number
  veiculoPlaca: string
  dataEntrada: string
  dataPrevista: string
  responsavel: string
  observacoes: string
  servicos: OSServico[]
  produtosOS: OSProduto[]
  valorMaoObra: number
  valorProdutos: number
  desconto: number
  valorFinal: number
  status: OSStatus
}

export type ContaStatus = 'pendente' | 'pago' | 'vencido'

export interface ContaReceber {
  id: number
  cliente: string
  descricao: string
  valor: number
  vencimento: string
  status: ContaStatus
}

export interface ContaPagar {
  id: number
  fornecedor: string
  descricao: string
  valor: number
  vencimento: string
  status: ContaStatus
}

export interface NotaFiscalProduto {
  codigo: string
  nome: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export interface NotaFiscal {
  id: number
  numero: string
  fornecedor: string
  cnpj: string
  dataEmissao: string
  valorTotal: number
  produtos: NotaFiscalProduto[]
  parcelas: number
}

export interface Compra {
  id: number
  numeroNfe: string
  fornecedor: string
  data: string
  valor: number
  quantidadeProdutos: number
}

export type TemaMode = 'escuro' | 'claro' | 'auto'

export interface DadosEmpresa {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  ie: string
  telefone: string
  whatsapp: string
  email: string
  site: string
  cep: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  logo: string | null
  logoReduzida: string | null
  favicon: string | null
}

export interface IdentidadeVisual {
  corPrincipal: string
  corSecundaria: string
  corBotoes: string
  corMenus: string
  corCards: string
  tema: TemaMode
}

export interface DadosFiscais {
  regimeTributario: string
  cnae: string
  inscricaoMunicipal: string
  serieNotaFiscal: string
  ambienteFiscal: 'producao' | 'homologacao'
}

export interface ComissaoConfig {
  funcionarioId: number
  nome: string
  percentual: number
  tipo: 'venda' | 'servico' | 'categoria'
  categoriaAlvo?: string
}

export interface OficinaConfig {
  tempoMedioServicos: number
  garantiaPadrao: number
  mensagemPadraoOS: string
  observacoesAutomaticas: string
  tecnicos: string[]
}

export interface ImpressaoConfig {
  cabecalho: string
  rodape: string
  aplicarEm: {
    os: boolean
    orcamentos: boolean
    relatorios: boolean
    comprovantes: boolean
  }
}

export interface MensagemWhatsApp {
  tipo: 'boas_vindas' | 'orcamento_aprovado' | 'servico_concluido' | 'cobranca'
  titulo: string
  mensagem: string
}

export interface BackupConfig {
  frequencia: 'manual' | 'diario' | 'semanal' | 'mensal'
  ultimoBackup: string
  tamanho: string
  ativo: boolean
}

export interface DashboardWidget {
  id: string
  label: string
  ativo: boolean
}

export interface LicencaInfo {
  plano: string
  dataVencimento: string
  status: 'ativa' | 'expirada' | 'cancelada'
  historicoPagamentos: { data: string; valor: number; status: string }[]
}

export type PlanoId = 'basic' | 'medium' | 'pro'
export type AssinaturaStatus = 'ativa' | 'expirada' | 'cancelada' | 'pendente' | 'teste'
export type CicloFaturamento = 'mensal' | 'anual'

export interface Plano {
  id: PlanoId
  nome: string
  descricao: string
  precoMensal: number
  precoAnual: number
  destaque?: string
  selo?: string
  funcionalidades: string[]
  limites: { label: string; valor: string }[]
  features: Record<string, boolean>
}

export interface Assinatura {
  id: number
  planoId: PlanoId
  status: AssinaturaStatus
  ciclo: CicloFaturamento
  dataContratacao: string
  dataVencimento: string
  dataTesteFim?: string
  valor: number
  empresa: string
  email: string
  renovacaoAutomatica: boolean
}

export interface PagamentoAssinatura {
  id: number
  data: string
  descricao: string
  valor: number
  metodo: string
  status: 'confirmado' | 'pendente' | 'cancelado'
  comprovante?: string
}

export interface NotificacaoAssinatura {
  id: number
  tipo: 'vencimento' | 'confirmacao' | 'teste' | 'upgrade'
  mensagem: string
  data: string
  lida: boolean
}
