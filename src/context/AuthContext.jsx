import { useEffect, useMemo, useState } from 'react'
import AuthContext from './auth-context'
import { supabase } from '../lib/supabaseClient'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (isMounted) {
        setSession(data.session ?? null)
        setIsAuthLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setIsAuthLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoggedIn: Boolean(session?.user),
      isAuthLoading,
    }),
    [isAuthLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
