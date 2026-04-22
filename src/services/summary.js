import { supabase } from '../lib/supabaseClient'

function buildFallbackSummary(payload) {
  const title = payload?.title?.trim() || 'Untitled post'
  const upvotes = Number(payload?.upvotes ?? 0)
  const comments = Array.isArray(payload?.comments) ? payload.comments : []
  const description = payload?.description?.trim() || ''

  const parts = [
    `"${title}" currently has ${upvotes} upvotes and ${comments.length} comments.`,
    description
      ? `Main topic: ${description.slice(0, 200)}${description.length > 200 ? '…' : ''}`
      : 'No detailed description was provided in the post body.',
    comments.length
      ? `Early comment trend: ${String(comments[0]).slice(0, 140)}${String(comments[0]).length > 140 ? '…' : ''}`
      : 'No comments yet, so sentiment is still forming.',
  ]

  return parts.join(' ')
}

export async function generatePostSummary(payload) {
  const { data, error } = await supabase.functions.invoke('summarize-post', {
    body: payload,
  })

  if (error) {
    return {
      summary: buildFallbackSummary(payload),
      warning: 'Function invoke failed; local fallback summary used.',
    }
  }
  if (!data?.summary) {
    return {
      summary: buildFallbackSummary(payload),
      warning: 'Function returned empty summary; local fallback summary used.',
    }
  }

  return data
}
