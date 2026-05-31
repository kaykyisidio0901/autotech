import type { OrdemServico } from '../types'

export const mockOrdensServico: OrdemServico[] = [
  {
    id: 1, numero: 'OS-001', clienteId: 1, clienteNome: 'Fernando Lima', veiculoId: 1, veiculoPlaca: 'ABC1D23',
    dataEntrada: '2026-05-20', dataPrevista: '2026-05-25', responsavel: 'João Silva', observacoes: 'Cliente relatou barulho no motor',
    servicos: [{ descricao: 'Troca de óleo e filtros', valor: 180 }, { descricao: 'Revisão geral', valor: 350 }],
    produtos: [{ nome: 'Óleo 5W30', quantidade: 4, valor: 160 }, { nome: 'Filtro de óleo', quantidade: 1, valor: 35 }],
    valorMaoObra: 530, valorProdutos: 195, desconto: 25, valorFinal: 700, status: 'finalizada',
  },
  {
    id: 2, numero: 'OS-002', clienteId: 2, clienteNome: 'Juliana Costa', veiculoId: 3, veiculoPlaca: 'HIJ7K89',
    dataEntrada: '2026-05-22', dataPrevista: '2026-05-28', responsavel: 'Maria Souza', observacoes: 'Instalação de som automotivo',
    servicos: [{ descricao: 'Instalação de módulo de som', valor: 250 }, { descricao: 'Passagem de cabos', valor: 120 }],
    produtos: [{ nome: 'Módulo de Som MP3', quantidade: 1, valor: 890 }, { nome: 'Kit Cabos RCA', quantidade: 1, valor: 60 }],
    valorMaoObra: 370, valorProdutos: 950, desconto: 0, valorFinal: 1320, status: 'em_andamento',
  },
  {
    id: 3, numero: 'OS-003', clienteId: 3, clienteNome: 'Roberto Alves', veiculoId: 4, veiculoPlaca: 'LMN0P12',
    dataEntrada: '2026-05-23', dataPrevista: '2026-05-30', responsavel: 'João Silva', observacoes: 'Reparo elétrico',
    servicos: [{ descricao: 'Diagnóstico elétrico', valor: 150 }],
    produtos: [{ nome: 'Sensor de Estacionamento', quantidade: 1, valor: 320 }],
    valorMaoObra: 150, valorProdutos: 320, desconto: 0, valorFinal: 470, status: 'aguardando_peca',
  },
  {
    id: 4, numero: 'OS-004', clienteId: 4, clienteNome: 'Camila Rocha', veiculoId: 5, veiculoPlaca: 'QRS3T45',
    dataEntrada: '2026-05-25', dataPrevista: '2026-05-27', responsavel: 'Ana Oliveira', observacoes: 'Troca de faróis',
    servicos: [{ descricao: 'Troca de faróis LED', valor: 100 }],
    produtos: [{ nome: 'Farol de LED Branco', quantidade: 2, valor: 1300 }],
    valorMaoObra: 100, valorProdutos: 1300, desconto: 50, valorFinal: 1350, status: 'aberta',
  },
  {
    id: 5, numero: 'OS-005', clienteId: 5, clienteNome: 'Diego Martins', veiculoId: 6, veiculoPlaca: 'UVW6X78',
    dataEntrada: '2026-05-26', dataPrevista: '2026-05-29', responsavel: 'Lucas Costa', observacoes: 'Revisão completa 50.000 km',
    servicos: [{ descricao: 'Revisão completa', valor: 500 }, { descricao: 'Alinhamento e balanceamento', valor: 180 }],
    produtos: [{ nome: 'Óleo 5W30', quantidade: 4, valor: 160 }, { nome: 'Filtro de ar', quantidade: 1, valor: 45 }, { nome: 'Filtro de cabine', quantidade: 1, valor: 55 }],
    valorMaoObra: 680, valorProdutos: 260, desconto: 40, valorFinal: 900, status: 'entregue',
  },
  {
    id: 6, numero: 'OS-006', clienteId: 1, clienteNome: 'Fernando Lima', veiculoId: 2, veiculoPlaca: 'EFG4H56',
    dataEntrada: '2026-05-27', dataPrevista: '2026-06-03', responsavel: 'Maria Souza', observacoes: 'Som automotivo completo',
    servicos: [{ descricao: 'Instalação completa som', valor: 400 }],
    produtos: [{ nome: 'Central Multimídia Pioneer', quantidade: 1, valor: 2200 }, { nome: 'Caixa Acústica 6" 300W', quantidade: 2, valor: 640 }],
    valorMaoObra: 400, valorProdutos: 2840, desconto: 100, valorFinal: 3140, status: 'em_andamento',
  },
]
