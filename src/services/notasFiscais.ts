import { mockNotasFiscais, mockCompras } from '../mock/notasFiscais'
import { mockProdutos } from '../mock/produtos'
import { mockMovimentacoes } from '../mock/movimentacoes'
import type { NotaFiscal, Compra, NotaFiscalProduto } from '../types'

const delay = () => new Promise(r => setTimeout(r, 200))

export async function listarNotasFiscais(): Promise<NotaFiscal[]> {
  await delay()
  return [...mockNotasFiscais]
}

export async function listarCompras(): Promise<Compra[]> {
  await delay()
  return [...mockCompras]
}

export async function importarXML(xmlContent: string): Promise<NotaFiscal> {
  await new Promise(r => setTimeout(r, 500))
  const cleaned = xmlContent.replace(/\sxmlns="[^"]+"/g, '')
  const parser = new DOMParser()
  const xml = parser.parseFromString(cleaned, 'text/xml')

  const getTag = (path: string) => {
    const parts = path.split('/')
    let node: Element = xml.documentElement
    for (const part of parts) {
      const child = node.querySelector(part)
      if (!child) return ''
      node = child
    }
    return node.textContent || ''
  }

  const produtos: NotaFiscalProduto[] = []
  const dets = xml.querySelectorAll('det')
  dets.forEach(det => {
    const prod = det.querySelector('prod')
    if (prod) {
      const cProd = prod.querySelector('cProd')?.textContent || ''
      const xProd = prod.querySelector('xProd')?.textContent || ''
      const qCom = prod.querySelector('qCom')?.textContent || '0'
      const vUnCom = prod.querySelector('vUnCom')?.textContent || '0'
      const vProd = prod.querySelector('vProd')?.textContent || '0'
      produtos.push({
        codigo: cProd,
        nome: xProd,
        quantidade: parseFloat(qCom) || 0,
        valorUnitario: parseFloat(vUnCom) || 0,
        valorTotal: parseFloat(vProd) || 0,
      })
    }
  })

  const nota: NotaFiscal = {
    id: Math.max(...mockNotasFiscais.map(n => n.id), 0) + 1,
    numero: getTag('ide/nNF') || `NF-${String(mockNotasFiscais.length + 1).padStart(6, '0')}`,
    fornecedor: getTag('emit/xNome') || 'Fornecedor Simulado',
    cnpj: getTag('emit/CNPJ') || '00.000.000/0000-00',
    dataEmissao: getTag('ide/dhEmi')?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    valorTotal: parseFloat(getTag('total/ICMSTot/vNF')) || produtos.reduce((s, p) => s + p.valorTotal, 0),
    produtos,
    parcelas: parseInt(getTag('cobr/fat/nFat')) || 1,
  }

  mockNotasFiscais.push(nota)
  return nota
}

export async function processarNota(notaId: number): Promise<{ estoqueAtualizado: number; contasGeradas: number }> {
  await new Promise(r => setTimeout(r, 300))
  const nota = mockNotasFiscais.find(n => n.id === notaId)
  if (!nota) return { estoqueAtualizado: 0, contasGeradas: 0 }

  let estoqueCount = 0
  for (const item of nota.produtos) {
    const existente = mockProdutos.find(p =>
      p.codigoInterno === item.codigo ||
      p.nome === item.nome ||
      p.nome.includes(item.nome) ||
      item.nome.includes(p.nome)
    )
    if (existente) {
      existente.quantidade += item.quantidade
      mockMovimentacoes.push({
        id: Math.max(...mockMovimentacoes.map(m => m.id), 0) + 1,
        produtoId: existente.id,
        produtoNome: existente.nome,
        tipo: 'entrada',
        quantidade: item.quantidade,
        data: new Date().toISOString().slice(0, 10),
        observacao: `NF-e ${nota.numero} - ${nota.fornecedor}`,
        responsavel: 'Sistema',
      })
      estoqueCount++
    }
  }

  const { mockContasPagar } = await import('../mock/financeiro')
  const contaId = Math.max(...mockContasPagar.map(c => c.id), 0) + 1
  const valorParcela = nota.valorTotal / Math.max(nota.parcelas, 1)
  const hoje = new Date()
  for (let i = 0; i < Math.max(nota.parcelas, 1); i++) {
    const venc = new Date(hoje)
    venc.setMonth(venc.getMonth() + i + 1)
    mockContasPagar.push({
      id: contaId + i,
      fornecedor: nota.fornecedor,
      descricao: `NF-e ${nota.numero} - Parcela ${i + 1}/${nota.parcelas}`,
      valor: valorParcela,
      vencimento: venc.toISOString().slice(0, 10),
      status: 'pendente',
    })
  }

  return { estoqueAtualizado: estoqueCount, contasGeradas: Math.max(nota.parcelas, 1) }
}
