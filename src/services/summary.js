import { supabase } from '../lib/supabaseClient'

export async function generatePostSummary(payload) {
  const { data, error } = await supabase.functions.invoke('summarize-post', {
    body: payload,
  })

  if (error) throw error
  return data
}
