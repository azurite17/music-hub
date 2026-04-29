import { supabase } from '../lib/supabaseClient'

export async function getCurrentProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const user = authData?.user
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  return {
    id: user.id,
    display_name: data?.display_name ?? '',
    avatar_url: data?.avatar_url ?? '',
  }
}

export async function upsertCurrentProfile({ displayName, avatarUrl }) {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const user = authData?.user
  if (!user) throw new Error('You must be logged in to update your profile.')

  const payload = {
    id: user.id,
    display_name: displayName.trim() || null,
    avatar_url: avatarUrl.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: payload.display_name,
      avatar_url: payload.avatar_url,
      updated_at: payload.updated_at,
    })
    .eq('id', user.id)
    .select('id')

  if (updateError) throw updateError
  if ((updatedRows?.length ?? 0) === 0) {
    const { error: insertError } = await supabase.from('profiles').insert(payload)
    if (insertError) throw insertError
  }

  return payload
}
