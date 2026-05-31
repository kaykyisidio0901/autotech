import { useState, useRef } from 'react'
import { importarXML, processarNota } from '../services/notasFiscais'
import type { NotaFiscal } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { formatCurrency, formatDate } from '../utils/format'
import { FileUp, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export function ImportarXML() {
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.xml')) {
      setResultMessage('Formato inválido. Selecione um arquivo XML.')
      return
    }
    setLoading(true)
    setResultMessage(null)
    try {
      const text = await file.text()
      const nota = await importarXML(text)
      setNotas(prev => [...prev, nota])
      setSelectedNota(nota)
      setPreviewOpen(true)
    } catch {
      setResultMessage('Erro ao processar XML. O arquivo pode estar corrompido.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleSelectClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  async function handleProcessar(nota: NotaFiscal) {
    setLoading(true)
    const result = await processarNota(nota.id)
    setResultMessage(`Nota processada! ${result.estoqueAtualizado} produto(s) atualizados no estoque e ${result.contasGeradas} conta(s) a pagar geradas.`)
    setPreviewOpen(false)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Importação de NF-e XML</h1>
      </div>

      {resultMessage && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${resultMessage.includes('sucesso') || resultMessage.includes('processada') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {resultMessage.includes('sucesso') || resultMessage.includes('processada') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm">{resultMessage}</span>
          <button onClick={() => setResultMessage(null)} className="ml-auto text-gray-500 hover:text-gray-300 cursor-pointer">✕</button>
        </div>
      )}

      <Card>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleSelectClick}
          className="border-2 border-dashed border-dark-600 rounded-xl p-16 text-center cursor-pointer hover:border-accent/50 transition-all group"
        >
          <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={handleFileChange} />
          <FileUp size={48} className="mx-auto text-gray-600 group-hover:text-accent transition-colors mb-4" />
          <p className="text-gray-400 group-hover:text-gray-300 transition-colors mb-2">
            Arraste o arquivo XML da NF-e aqui ou clique para selecionar
          </p>
          <p className="text-gray-600 text-xs">Formatos aceitos: .xml</p>
        </div>
      </Card>

      {notas.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Notas Importadas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-dark-600">
                  <th className="text-left py-3 px-2">Número</th>
                  <th className="text-left py-3 px-2">Fornecedor</th>
                  <th className="text-left py-3 px-2">CNPJ</th>
                  <th className="text-left py-3 px-2">Emissão</th>
                  <th className="text-right py-3 px-2">Valor</th>
                  <th className="text-center py-3 px-2">Produtos</th>
                  <th className="text-center py-3 px-2">Ação</th>
                </tr>
              </thead>
              <tbody>
                {notas.map(n => (
                  <tr key={n.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-3 px-2 font-medium text-gray-200">{n.numero}</td>
                    <td className="py-3 px-2 text-gray-400">{n.fornecedor}</td>
                    <td className="py-3 px-2 text-gray-400">{n.cnpj}</td>
                    <td className="py-3 px-2 text-gray-400">{formatDate(n.dataEmissao)}</td>
                    <td className="py-3 px-2 text-right text-gray-200">{formatCurrency(n.valorTotal)}</td>
                    <td className="py-3 px-2 text-center text-gray-400">{n.produtos.length}</td>
                    <td className="py-3 px-2 text-center">
                      <Button variant="ghost" onClick={() => { setSelectedNota(n); setPreviewOpen(true) }}>
                        <FileText size={16} className="mr-1" />Visualizar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={previewOpen && selectedNota !== null} onClose={() => setPreviewOpen(false)} title={`NF-e ${selectedNota?.numero || ''}`} size="xl">
        {selectedNota && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Fornecedor:</span> <span className="text-gray-200 ml-2">{selectedNota.fornecedor}</span></div>
              <div><span className="text-gray-500">CNPJ:</span> <span className="text-gray-200 ml-2">{selectedNota.cnpj}</span></div>
              <div><span className="text-gray-500">Data Emissão:</span> <span className="text-gray-200 ml-2">{formatDate(selectedNota.dataEmissao)}</span></div>
              <div><span className="text-gray-500">Valor Total:</span> <span className="text-accent ml-2 font-semibold">{formatCurrency(selectedNota.valorTotal)}</span></div>
              <div><span className="text-gray-500">Parcelas:</span> <span className="text-gray-200 ml-2">{selectedNota.parcelas}x</span></div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Produtos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-dark-600">
                      <th className="text-left py-2 px-2">Código</th>
                      <th className="text-left py-2 px-2">Produto</th>
                      <th className="text-right py-2 px-2">Qtd</th>
                      <th className="text-right py-2 px-2">Valor Un.</th>
                      <th className="text-right py-2 px-2">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNota.produtos.map((p, i) => (
                      <tr key={i} className="border-b border-dark-700">
                        <td className="py-2 px-2 text-gray-400">{p.codigo}</td>
                        <td className="py-2 px-2 text-gray-200">{p.nome}</td>
                        <td className="py-2 px-2 text-right text-gray-400">{p.quantidade}</td>
                        <td className="py-2 px-2 text-right text-gray-400">{formatCurrency(p.valorUnitario)}</td>
                        <td className="py-2 px-2 text-right text-gray-200">{formatCurrency(p.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Fechar</Button>
              <Button onClick={() => handleProcessar(selectedNota)} disabled={loading}>
                <CheckCircle size={16} className="mr-2" />Confirmar e Processar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
