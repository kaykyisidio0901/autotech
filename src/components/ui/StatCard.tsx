import type { ReactNode } from 'react'
import { Card } from './Card'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  accent?: boolean
}

export function StatCard({ title, value, icon, accent = false }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
        accent ? 'bg-accent/20 text-accent' : 'bg-dark-700 text-gray-400'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-100 mt-0.5">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
      </div>
    </Card>
  )
}
