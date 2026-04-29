export function getDisplayName({ profile, user, fallbackId }) {
  const explicit = profile?.display_name?.trim()
  if (explicit) return explicit

  const metaName = user?.user_metadata?.full_name?.trim()
  if (metaName) return metaName

  const emailPrefix = user?.email?.split('@')?.[0]?.trim()
  if (emailPrefix) return emailPrefix

  if (fallbackId) return `user-${String(fallbackId).slice(0, 6)}`
  return 'music-fan'
}

export function getAvatarUrl({ profile }) {
  const raw = profile?.avatar_url?.trim()
  return raw || null
}

export function getInitials(name) {
  if (!name?.trim()) return 'M'
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (words.length === 0) return 'M'
  return words.map((w) => w[0]?.toUpperCase() || '').join('')
}
