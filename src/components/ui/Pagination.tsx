interface PaginationProps {
  current: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export function Pagination({ current, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  function range() {
    const pages: number[] = []
    const start = Math.max(1, current - 2)
    const end = Math.min(totalPages, current + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="flex items-center justify-between pt-4 text-sm">
      <span className="text-gray-500">{total} registro(s)</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="px-3 py-1.5 rounded-lg bg-dark-700 text-gray-400 hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          ‹
        </button>
        {range().map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              p === current ? 'bg-accent text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className="px-3 py-1.5 rounded-lg bg-dark-700 text-gray-400 hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  )
}
