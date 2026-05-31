export function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatCNPJ(cnpj: string) {
  return cnpj
}

export function formatPhone(phone: string) {
  return phone
}

export function situacaoEstoque(quantidade: number, minimo: number) {
  if (quantidade === 0) return { label: 'Sem Estoque', variant: 'danger' as const }
  if (quantidade <= minimo * 0.3) return { label: 'Crítico', variant: 'danger' as const }
  if (quantidade <= minimo) return { label: 'Baixo', variant: 'warning' as const }
  return { label: 'Normal', variant: 'success' as const }
}
