import { supabase } from '../lib/supabaseClient'

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, author_id, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
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
