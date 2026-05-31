import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'cursor-pointer font-medium rounded-lg transition-all duration-200 text-sm px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-gray-200 border border-dark-600',
    ghost: 'bg-transparent hover:bg-dark-700 text-gray-400',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
