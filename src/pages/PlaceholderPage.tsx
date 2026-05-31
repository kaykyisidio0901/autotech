interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">🚧</span>
      <h1 className="text-2xl font-bold text-gray-200">{title}</h1>
      <p className="text-gray-500 mt-2">Módulo em desenvolvimento</p>
    </div>
  )
}
