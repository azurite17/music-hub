const MAX_POST_GENRES = 5
const MAX_GENRE_LEN = 40

/** Split comma/semicolon-separated genre string into display tags. */
export function parseGenreTags(raw) {
  if (!raw?.trim()) return []
  return raw
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 24)
}

/**
 * Normalize post genre list: trim, cap length, dedupe case-insensitively, max 5.
 * @param {unknown} input string[], string, or null
 * @returns {string[]}
 */
export function normalizePostGenres(input) {
  const list = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/[,;]+/)
      : []

  const out = []
  const seen = new Set()
  for (const raw of list) {
    const t = typeof raw === 'string' ? raw.trim().slice(0, MAX_GENRE_LEN) : ''
    if (!t) continue
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
    if (out.length >= MAX_POST_GENRES) break
  }
  return out
}

/** Coerce DB value (array or null) to string[]. */
export function coerceGenresArray(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((g) => typeof g === 'string' && g.trim()).map((g) => g.trim())
  }
  return []
}
