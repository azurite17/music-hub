import { supabase } from '../lib/supabaseClient'

export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, upvotes_count, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createPost(postPayload) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const userId = authData?.user?.id
  if (!userId) {
    throw new Error('You must be logged in to create a post.')
  }

  const payload = {
    author_id: userId,
    title: postPayload.title.trim(),
    content: postPayload.content.trim() || null,
    image_url: postPayload.imageUrl.trim() || null,
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(payload)
    .select('id')
    .single()

  if (error) throw error
  return data
}
