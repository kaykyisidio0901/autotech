import { useState } from 'react'
import type { Venda } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { generateReceiptPdf } from './generatePdf'

const formaPagamentoLabel: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'Pix',
  boleto: 'Boleto',
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

interface ReceiptModalProps {
  venda: Venda
  onClose: () => void
}

function buildReceiptText(venda: Venda) {
  const line = '─'.repeat(40)
  let text = `⚡ AUTOTECH MANAGER\n`
  text += `CUPOM NÃO FISCAL\n`
  text += `${line}\n`
  text += `ID: #${String(venda.id).padStart(4, '0')}\n`
  text += `Data: ${new Date(venda.data).toLocaleDateString('pt-BR')}\n`
  text += `Cliente: ${venda.cliente}\n`
  text += `Vendedor: ${venda.vendedor}\n`
  text += `${line}\n`
  text += `ITEM                       QTD  TOTAL\n`
  for (const item of venda.itens) {
    const nome = item.produto.padEnd(24).slice(0, 24)
    const qtd = String(item.quantidade).padStart(3)
    const sub = formatCurrency(item.quantidade * item.precoUnitario).padStart(10)
    text += `${nome} ${qtd} ${sub}\n`
  }
  text += `${line}\n`
  if (venda.desconto > 0) {
    const sub = venda.itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0)
    text += `Subtotal: ${formatCurrency(sub)}\n`
    text += `Desconto: -${formatCurrency(venda.desconto)}\n`
  }
  text += `TOTAL: ${formatCurrency(venda.total)}\n`
  const pag = formaPagamentoLabel[venda.formaPagamento] ?? venda.formaPagamento
  const parc = venda.parcelas > 1 ? ` (${venda.parcelas}x)` : ''
  text += `Pagamento: ${pag}${parc}\n`
  text += `${line}\n`
  text += `Obrigado pela preferência!\n`
  return text
}

export function ReceiptModal({ venda, onClose }: ReceiptModalProps) {
  const [telefone, setTelefone] = useState('55')

  function handleDownload() {
    const doc = generateReceiptPdf(venda)
    doc.save(`venda-${String(venda.id).padStart(4, '0')}.pdf`)
  }

  function handleWhatsApp() {
    const texto = encodeURIComponent(buildReceiptText(venda))
    const url = `https://wa.me/${telefone.replace(/\D/g, '')}?text=${texto}`
    window.open(url, '_blank')
  }

  function handleEmail() {
    const assunto = encodeURIComponent(`Cupom Não Fiscal - Venda #${String(venda.id).padStart(4, '0')}`)
    const corpo = encodeURIComponent(buildReceiptText(venda))
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Comprovante de Venda</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl cursor-pointer">✕</button>
        </div>

        <div className="bg-dark-900 rounded-lg p-4 mb-4 text-sm space-y-1">
          <p className="text-gray-400">ID: <span className="text-gray-200 font-mono">#{String(venda.id).padStart(4, '0')}</span></p>
          <p className="text-gray-400">Cliente: <span className="text-gray-200">{venda.cliente}</span></p>
          <p className="text-gray-400">Data: <span className="text-gray-200">{new Date(venda.data).toLocaleDateString('pt-BR')}</span></p>
          {venda.desconto > 0 && (
            <>
              <p className="text-gray-400">Subtotal: <span className="text-gray-200">{formatCurrency(venda.itens.reduce((acc, i) => acc + i.quantidade * i.precoUnitario, 0))}</span></p>
              <p className="text-gray-400">Desconto: <span className="text-red-400">-{formatCurrency(venda.desconto)}</span></p>
            </>
          )}
          <p className="text-gray-400">Total: <span className="text-accent font-semibold">{formatCurrency(venda.total)}</span></p>
          <p className="text-gray-400">Pagamento: <span className="text-gray-200">{formaPagamentoLabel[venda.formaPagamento]}{venda.parcelas > 1 ? ` (${venda.parcelas}x)` : ''}</span></p>
        </div>

        <div className="space-y-3 mb-4">
          <Button fullWidth variant="secondary" onClick={handleDownload}>
            📄 Baixar PDF
          </Button>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="WhatsApp do cliente"
                type="tel"
                placeholder="5511999999999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <Button onClick={handleWhatsApp} disabled={telefone.replace(/\D/g, '').length < 10}>
              💬 Enviar
            </Button>
          </div>

          <Button fullWidth variant="secondary" onClick={handleEmail}>
            ✉️ Enviar por E-mail
          </Button>
        </div>

        <Button fullWidth variant="ghost" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  )
}
