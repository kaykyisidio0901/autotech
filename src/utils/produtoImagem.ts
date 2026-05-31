const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e11d48', '#0ea5e9', '#a855f7', '#22c55e',
  '#f43f5e', '#38bdf8', '#818cf8', '#34d399', '#fb923c',
  '#2dd4bf', '#c084fc', '#4ade80', '#f472b6', '#64748b',
]

function svgB64(id: number, label: string, size: number): string {
  const c = COLORS[(id - 1) % COLORS.length]
  const s = size
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><rect width="${s}" height="${s}" fill="${c}" opacity=".15"/><rect x="${s*.15}" y="${s*.15}" width="${s*.7}" height="${s*.7}" rx="${s*.1}" fill="${c}" opacity=".3"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${s*.18}" font-weight="700" fill="${c}">${label}</text></svg>`
  try {
    return `data:image/svg+xml;base64,${btoa(svg)}`
  } catch {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }
}

export function getProdutoImage(id: number): string {
  return svgB64(id, String(id), 300)
}

export function getProdutoGallery(id: number): string[] {
  return [
    svgB64(id, String(id), 300),
    svgB64(id + 100, `${id}-2`, 300),
    svgB64(id + 200, `${id}-3`, 300),
  ]
}

export function getProdutoThumb(id: number): string {
  return svgB64(id, String(id), 80)
}

export function getProdutoCatalog(id: number): string {
  return svgB64(id, `Prod ${id}`, 400)
}
