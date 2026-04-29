import { supabase } from '../lib/supabaseClient'
import { formatRelativeTime } from '../utils/time'
import { getAvatarUrl, getDisplayName } from '../utils/user'

async function fetchProfilesByIds(userIds = []) {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) return new Map()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', unique)

  if (error) return new Map()
  return new Map((data ?? []).map((p) => [p.id, p]))
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, author_id, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error

  const comments = data ?? []
  const profileMap = await fetchProfilesByIds(comments.map((c) => c.author_id))

  return comments.map((comment) => {
    const profile = profileMap.get(comment.author_id)
    return {
      ...comment,
      author_name: getDisplayName({ profile, fallbackId: comment.author_id }),
      author_avatar_url: getAvatarUrl({ profile }),
      relative_created_at: formatRelativeTime(comment.created_at),
    }
  })
}

export async function createComment(postId, content) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const userId = authData?.user?.id
  if (!userId) throw new Error('You must be logged in to comment.')

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: userId,
      content: content.trim(),
    })
    .select('id')
    .single()

  if (error) throw error
  return data
}
