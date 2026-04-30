import { supabase } from '../lib/supabaseClient'

export async function getCurrentProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const user = authData?.user
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  return {
    id: user.id,
    display_name: data?.display_name ?? '',
    avatar_url: data?.avatar_url ?? '',
    bio: data?.bio ?? '',
    location: data?.location ?? '',
    favorite_genres: data?.favorite_genres ?? '',
    instagram_url: data?.instagram_url ?? '',
    spotify_url: data?.spotify_url ?? '',
  }
}

function normalizeProfilePayload(userId, fields) {
  return {
    id: userId,
    display_name: fields.displayName?.trim() || null,
    avatar_url: fields.avatarUrl?.trim() || null,
    bio: fields.bio?.trim() || null,
    location: fields.location?.trim() || null,
    favorite_genres: fields.favoriteGenres?.trim() || null,
    instagram_url: fields.instagramUrl?.trim() || null,
    spotify_url: fields.spotifyUrl?.trim() || null,
    updated_at: new Date().toISOString(),
  }
}

function isMissingColumnError(error) {
  const message = String(error?.message ?? '')
  return message.includes('column') && message.includes('does not exist')
}

export async function upsertCurrentProfile(fields) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const user = authData?.user
  if (!user) throw new Error('You must be logged in to update your profile.')

  const payload = normalizeProfilePayload(user.id, fields)
  const extendedUpdate = {
    display_name: payload.display_name,
    avatar_url: payload.avatar_url,
    bio: payload.bio,
    location: payload.location,
    favorite_genres: payload.favorite_genres,
    instagram_url: payload.instagram_url,
    spotify_url: payload.spotify_url,
    updated_at: payload.updated_at,
  }

  let updatedRows = []
  let updateError = null
  ;({ data: updatedRows, error: updateError } = await supabase
    .from('profiles')
    .update(extendedUpdate)
    .eq('id', user.id)
    .select('id'))

  if (isMissingColumnError(updateError)) {
    const { data: basicRows, error: basicUpdateError } = await supabase
      .from('profiles')
      .update({
        display_name: payload.display_name,
        avatar_url: payload.avatar_url,
        updated_at: payload.updated_at,
      })
      .eq('id', user.id)
      .select('id')
    updatedRows = basicRows ?? []
    updateError = basicUpdateError
  }

  if (updateError) throw updateError
  if ((updatedRows?.length ?? 0) === 0) {
    let insertError = null
    ;({ error: insertError } = await supabase.from('profiles').insert(payload))
    if (isMissingColumnError(insertError)) {
      ;({ error: insertError } = await supabase.from('profiles').insert({
        id: payload.id,
        display_name: payload.display_name,
        avatar_url: payload.avatar_url,
        updated_at: payload.updated_at,
      }))
    }
    if (insertError) throw insertError
  }

  return payload
}

export async function fetchPublicProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return {
    id: userId,
    display_name: data?.display_name ?? '',
    avatar_url: data?.avatar_url ?? '',
    bio: data?.bio ?? '',
    location: data?.location ?? '',
    favorite_genres: data?.favorite_genres ?? '',
    instagram_url: data?.instagram_url ?? '',
    spotify_url: data?.spotify_url ?? '',
  }
}
