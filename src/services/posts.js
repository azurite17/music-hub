import { supabase } from '../lib/supabaseClient'

export async function fetchPosts({ searchTerm = '', sortBy = 'created_at' } = {}) {
  const resolvedSortBy = sortBy === 'upvotes_count' ? 'upvotes_count' : 'created_at'
  let query = supabase
    .from('posts')
    .select('id, title, upvotes_count, created_at')
    .order(resolvedSortBy, { ascending: false })

  const trimmedSearch = searchTerm.trim()
  if (trimmedSearch) {
    query = query.ilike('title', `%${trimmedSearch}%`)
  }

  const { data, error } = await query

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

export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from('posts')
    .select('id, author_id, title, content, image_url, upvotes_count, created_at')
    .eq('id', postId)
    .single()

  if (error) throw error
  return data
}

export async function upvotePost(postId) {
  const post = await fetchPostById(postId)

  const { data, error } = await supabase
    .from('posts')
    .update({ upvotes_count: (post.upvotes_count ?? 0) + 1 })
    .eq('id', postId)
    .select('upvotes_count')
    .single()

  if (error) throw error
  return data
}

export async function updatePost(postId, postPayload) {
  const payload = {
    title: postPayload.title.trim(),
    content: postPayload.content.trim() || null,
    image_url: postPayload.imageUrl.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', postId)
    .select('id')
    .single()

  if (error) throw error
  return data
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}
