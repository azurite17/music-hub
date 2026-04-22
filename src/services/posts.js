import { supabase } from '../lib/supabaseClient'
import { DEFAULT_POST_FLAG } from '../constants/postFlags'

export async function fetchPosts({
  searchTerm = '',
  sortBy = 'created_at',
  flagFilter = 'all',
} = {}) {
  const resolvedSortBy = sortBy === 'upvotes_count' ? 'upvotes_count' : 'created_at'
  let query = supabase
    .from('posts')
    .select(
      'id, title, upvotes_count, created_at, content, image_url, flag, repost_of_post_id',
    )
    .order(resolvedSortBy, { ascending: false })

  const trimmedSearch = searchTerm.trim()
  if (trimmedSearch) {
    query = query.ilike('title', `%${trimmedSearch}%`)
  }

  if (flagFilter && flagFilter !== 'all') {
    query = query.eq('flag', flagFilter)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function fetchPostsByAuthor(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, title, upvotes_count, created_at, content, image_url, flag, repost_of_post_id',
    )
    .eq('author_id', authorId)
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

  const repostId = postPayload.repostOfPostId?.trim()
  const payload = {
    author_id: userId,
    title: postPayload.title.trim(),
    content: postPayload.content.trim() || null,
    image_url: postPayload.imageUrl.trim() || null,
    flag: postPayload.flag?.trim() || DEFAULT_POST_FLAG,
    repost_of_post_id: repostId || null,
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
    .select(
      'id, author_id, title, content, image_url, upvotes_count, created_at, flag, repost_of_post_id',
    )
    .eq('id', postId)
    .single()

  if (error) throw error
  return data
}

export async function fetchPostThreadRef(postId) {
  if (!postId) return null
  const { data, error } = await supabase
    .from('posts')
    .select('id, title')
    .eq('id', postId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upvotePost(postId) {
  const { data, error } = await supabase.rpc('increment_post_upvote', {
    p_post_id: postId,
  })

  if (error) throw error
  return { upvotes_count: data }
}

export async function updatePost(postId, postPayload) {
  const payload = {
    title: postPayload.title.trim(),
    content: postPayload.content.trim() || null,
    image_url: postPayload.imageUrl.trim() || null,
    flag: postPayload.flag?.trim() || DEFAULT_POST_FLAG,
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
