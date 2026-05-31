import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <input
        className={`px-3 py-2.5 rounded-lg bg-dark-800 border border-dark-600 text-gray-100 placeholder-gray-500 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
