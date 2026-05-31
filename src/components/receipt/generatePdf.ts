import jsPDF from 'jspdf'
import type { Venda } from '../../types'

export function generateReceiptPdf(venda: Venda) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  doc.setFillColor(10, 10, 15)

  let y = 20

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('AUTOTECH MANAGER', margin, y)
  y += 5
  doc.setFontSize(7)
  doc.text('Sistema de Gestao Automotiva', margin, y)
  y += 3
  doc.text('www.autotechmanager.com.br', margin, y)
  y += 8

  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFontSize(16)
  doc.setTextColor(243, 244, 246)
  doc.setFont('helvetica', 'bold')
  doc.text('CUPOM NAO FISCAL', pageWidth / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text(`ID: #${String(venda.id).padStart(4, '0')}`, margin, y)
  doc.text(`Data: ${new Date(venda.data).toLocaleDateString('pt-BR')}`, pageWidth - margin, y, { align: 'right' })
  y += 5
  doc.text(`Cliente: ${venda.cliente}`, margin, y)
  doc.text(`Vendedor: ${venda.vendedor}`, pageWidth - margin, y, { align: 'right' })

  y += 10

  doc.setDrawColor(75, 85, 99)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(9)
  doc.setTextColor(156, 163, 175)
  doc.setFont('helvetica', 'bold')
  doc.text('Item', margin, y)
  doc.text('Qtd', margin + 90, y)
  doc.text('Valor Unit.', margin + 110, y)
  doc.text('Subtotal', pageWidth - margin, y, { align: 'right' })
  y += 4

  doc.setDrawColor(75, 85, 99)
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageWidth - margin, y)
  y += 4

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(243, 244, 246)

  for (const item of venda.itens) {
    const nome =
      item.produto.length > 38
        ? item.produto.slice(0, 35) + '...'
        : item.produto

    doc.setFontSize(8)
    doc.text(nome, margin, y)

    const qtdX = margin + 90
    doc.text(String(item.quantidade), qtdX, y)

    const valUnit = `R$ ${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    doc.text(valUnit, margin + 110, y)

    const sub = item.quantidade * item.precoUnitario
    const subStr = `R$ ${sub.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    doc.text(subStr, pageWidth - margin, y, { align: 'right' })

    y += 5
  }

  y += 2

  doc.setDrawColor(75, 85, 99)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  if (venda.desconto > 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(156, 163, 175)
    const subVal = venda.itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0)
    const subStr = `R$ ${subVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    doc.text('Subtotal:', margin, y)
    doc.text(subStr, pageWidth - margin, y, { align: 'right' })
    y += 5
    doc.setTextColor(239, 68, 68)
    const descStr = `-R$ ${venda.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    doc.text('Desconto:', margin, y)
    doc.text(descStr, pageWidth - margin, y, { align: 'right' })
    y += 6
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129)
  const totalStr = `R$ ${venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  doc.text('Total:', margin, y)
  doc.text(totalStr, pageWidth - margin, y, { align: 'right' })

  y += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(156, 163, 175)

  const pagLabel: Record<string, string> = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartao de Credito',
    cartao_debito: 'Cartao de Debito',
    pix: 'Pix',
    boleto: 'Boleto',
  }
  const pagamento = pagLabel[venda.formaPagamento] ?? venda.formaPagamento
  const parcelaStr = venda.parcelas > 1 ? ` (${venda.parcelas}x)` : ''
  doc.text(`Forma de Pagamento: ${pagamento}${parcelaStr}`, margin, y)

  y += 10

  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFontSize(7)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('Obrigado pela preferencia!', pageWidth / 2, y, { align: 'center' })
  y += 4
  doc.text('Este documento nao possui valor fiscal.', pageWidth / 2, y, { align: 'center' })

  return doc
}
