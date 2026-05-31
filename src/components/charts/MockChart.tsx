interface MockChartProps {
  data: number[]
  height?: number
}

export function MockChart({ data, height = 160 }: MockChartProps) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-accent/80 hover:bg-accent transition-all"
          style={{ height: `${(value / max) * 100}%` }}
          title={`R$ ${value.toLocaleString('pt-BR')}`}
        />
      ))}
    </div>
  )
}
