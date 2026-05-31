import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-dark-800 border border-dark-600 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}
