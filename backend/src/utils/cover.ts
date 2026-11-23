const GENRE_COLORS: Record<string, string> = {
  MMORPG: '#1f6f5b',
  Shooter: '#7f1d1d',
  Strategy: '#1e3a8a',
  MOBA: '#6d28d9',
  Card: '#92400e',
  'Battle Royale': '#9a3412',
  Sports: '#166534',
  Racing: '#0f766e',
}

export function cover(title: string, genre: string): string {
  const color = GENRE_COLORS[genre] ?? '#323238'
  const safeTitle = title.replace(/[&<>"]/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="46%" fill="#ffffff" font-size="28" font-family="Segoe UI, sans-serif" text-anchor="middle">${safeTitle}</text><text x="50%" y="62%" fill="#d4d4d8" font-size="16" font-family="Segoe UI, sans-serif" text-anchor="middle">${genre}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
