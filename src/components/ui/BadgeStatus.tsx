interface BadgeStatusProps {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'info' | 'muted'
}

const variants = {
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-500/20 text-blue-400',
  muted: 'bg-gray-500/20 text-gray-400',
}

export function BadgeStatus({ label, variant }: BadgeStatusProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
