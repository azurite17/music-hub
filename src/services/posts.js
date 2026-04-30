import { DEFAULT_POST_FLAG } from '../constants/postFlags'
import { supabase } from '../lib/supabaseClient'
import { coerceGenresArray, normalizePostGenres } from '../utils/genres'
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

async function fetchCommentCounts(postIds = []) {
  const unique = [...new Set(postIds.filter(Boolean))]
  if (unique.length === 0) return new Map()

  const { data, error } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', unique)

  if (error) return new Map()

  const countMap = new Map()
  for (const row of data ?? []) {
    const key = row.post_id
    countMap.set(key, (countMap.get(key) ?? 0) + 1)
  }
  return countMap
}

function decoratePost(post, profileMap, commentsCountMap) {
  const profile = profileMap.get(post.author_id)
  const authorName = getDisplayName({ profile, fallbackId: post.author_id })
  return {
    ...post,
    author_name: authorName,
    author_avatar_url: getAvatarUrl({ profile }),
    comments_count: commentsCountMap.get(post.id) ?? 0,
    genres: coerceGenresArray(post.genres),
  }
}

/** Strip ILIKE wildcards from user input so search stays predictable and safe. */
function sanitizeGenreSearchFragment(raw) {
  return String(raw ?? '')
    .trim()
    .slice(0, 80)
    .replace(/[%_\\]/g, '')
    .trim()
}

function sortPosts(posts, sortBy) {
  if (sortBy === 'upvotes_count') {
    return [...posts].sort((a, b) => (b.upvotes_count ?? 0) - (a.upvotes_count ?? 0))
  }
  if (sortBy === 'comments_count') {
    return [...posts].sort((a, b) => (b.comments_count ?? 0) - (a.comments_count ?? 0))
  }
  if (sortBy === 'oldest') {
    return [...posts].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
  }
  return [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

export async function fetchPosts({
  searchTerm = '',
  sortBy = 'created_at',
  flagFilter = 'all',
  genreFilter = 'all',
  genreSearch = '',
} = {}) {
  let query = supabase
    .from('posts')
    .select(
      'id, author_id, title, upvotes_count, created_at, content, image_url, flag, repost_of_post_id, genres',
    )

  const trimmedSearch = searchTerm.trim()
  if (trimmedSearch) {
    query = query.ilike('title', `%${trimmedSearch}%`)
  }

  if (flagFilter && flagFilter !== 'all') {
    query = query.eq('flag', flagFilter)
  }

  if (genreFilter && genreFilter !== 'all') {
    query = query.contains('genres', [genreFilter])
  }

  const genreFragment = sanitizeGenreSearchFragment(genreSearch)
  if (genreFragment) {
    query = query.ilike('genres_flat', `%${genreFragment}%`)
  }

  const { data, error } = await query
  if (error) throw error

  const posts = data ?? []
  const [profileMap, commentsCountMap] = await Promise.all([
    fetchProfilesByIds(posts.map((p) => p.author_id)),
    fetchCommentCounts(posts.map((p) => p.id)),
  ])

  const decorated = posts.map((post) => decoratePost(post, profileMap, commentsCountMap))
  return sortPosts(decorated, sortBy)
}

export async function fetchTrendingPosts(limit = 5) {
  const posts = await fetchPosts({ sortBy: 'upvotes_count' })
  return posts.slice(0, limit)
}

export async function fetchPostsByAuthor(authorId) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, author_id, title, upvotes_count, created_at, content, image_url, flag, repost_of_post_id, genres',
    )
    .eq('author_id', authorId)

  if (error) throw error

  const posts = data ?? []
  const [profileMap, commentsCountMap] = await Promise.all([
    fetchProfilesByIds(posts.map((p) => p.author_id)),
    fetchCommentCounts(posts.map((p) => p.id)),
  ])

  const decorated = posts.map((post) => decoratePost(post, profileMap, commentsCountMap))
  return sortPosts(decorated, 'created_at')
}

export async function createPost(postPayload) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const userId = authData?.user?.id
  if (!userId) {
    throw new Error('You must be logged in to create a post.')
  }

  const repostId = postPayload.repostOfPostId?.trim()
  const genres = normalizePostGenres(postPayload.genres)
  const payload = {
    author_id: userId,
    title: postPayload.title.trim(),
    content: postPayload.content.trim() || null,
    image_url: postPayload.imageUrl.trim() || null,
    flag: postPayload.flag?.trim() || DEFAULT_POST_FLAG,
    repost_of_post_id: repostId || null,
    genres,
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
      'id, author_id, title, content, image_url, upvotes_count, created_at, flag, repost_of_post_id, genres',
    )
    .eq('id', postId)
    .single()

  if (error) throw error

  const profileMap = await fetchProfilesByIds([data.author_id])
  const authorProfile = profileMap.get(data.author_id)

  return {
    ...data,
    author_name: getDisplayName({ profile: authorProfile, fallbackId: data.author_id }),
    author_avatar_url: getAvatarUrl({ profile: authorProfile }),
    genres: coerceGenresArray(data.genres),
  }
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
  const genres = normalizePostGenres(postPayload.genres)
  const payload = {
    title: postPayload.title.trim(),
    content: postPayload.content.trim() || null,
    image_url: postPayload.imageUrl.trim() || null,
    flag: postPayload.flag?.trim() || DEFAULT_POST_FLAG,
    genres,
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
