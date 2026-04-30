import { supabase } from '../lib/supabaseClient'

export const POST_IMAGES_BUCKET = 'post-images'

const MAX_POST_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function extensionForMime(mime) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

async function validateImageAndUser(file, maxBytes) {
  if (!file) throw new Error('No file selected.')

  const type = (file.type || '').toLowerCase()
  if (!ALLOWED_TYPES.has(type)) {
    throw new Error('Please choose a JPEG, PNG, WebP, or GIF.')
  }
  if (file.size > maxBytes) {
    const mb = maxBytes / (1024 * 1024)
    throw new Error(`Image must be ${mb} MB or smaller.`)
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  const userId = authData?.user?.id
  if (!userId) throw new Error('You must be logged in to upload images.')

  return { userId, type, ext: extensionForMime(type) }
}

/**
 * Upload a post image to Supabase Storage (public bucket `post-images`).
 * Object path: `{userId}/{uuid}.{ext}` — RLS should restrict writes to own folder.
 */
export async function uploadPostImage(file) {
  const { userId, type, ext } = await validateImageAndUser(file, MAX_POST_IMAGE_BYTES)
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage.from(POST_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: type,
  })

  if (uploadError) throw uploadError

  const { data: pub } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path)
  const url = pub?.publicUrl
  if (!url) throw new Error('Upload succeeded but public URL was not returned.')

  return url
}

/**
 * Upload or replace profile avatar at `{userId}/avatar.{ext}` (same bucket as post images).
 */
export async function uploadProfileAvatar(file) {
  const { userId, type, ext } = await validateImageAndUser(file, MAX_AVATAR_BYTES)
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage.from(POST_IMAGES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: type,
  })

  if (uploadError) throw uploadError

  const { data: pub } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path)
  const url = pub?.publicUrl
  if (!url) throw new Error('Upload succeeded but public URL was not returned.')

  return url
}
