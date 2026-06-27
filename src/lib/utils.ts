export function parseAlur(alur: string): string[] {
  try {
    const parsed = JSON.parse(alur)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return alur.split("\n").filter(Boolean)
}

export function parseMisi(misi: string): string[] {
  try {
    const parsed = JSON.parse(misi)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return misi.split("\n").filter(Boolean)
}
