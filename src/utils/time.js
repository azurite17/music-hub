export function formatRelativeTime(dateInput) {
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return 'just now'

  const now = Date.now()
  const diffSeconds = Math.floor((now - date.getTime()) / 1000)

  if (diffSeconds < 60) return `${Math.max(diffSeconds, 1)}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
