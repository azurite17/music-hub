import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const OAUTH_PROFILE_FLAG = 'mh_oauth_profile_redirect'

/**
 * After Google OAuth, Supabase returns to redirectTo (usually `/`).
 * We set sessionStorage before starting OAuth so we can send the user
 * to their profile once the session is available.
 */
function PostOAuthProfileRedirect() {
  const { isLoggedIn, user, isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthLoading || !isLoggedIn || !user?.id) return
    if (sessionStorage.getItem(OAUTH_PROFILE_FLAG) !== '1') return

    sessionStorage.removeItem(OAUTH_PROFILE_FLAG)

    const path = location.pathname
    if (path === '/' || path === '/auth') {
      navigate(`/users/${user.id}`, { replace: true })
    }
  }, [isAuthLoading, isLoggedIn, user?.id, location.pathname, navigate])

  return null
}

export default PostOAuthProfileRedirect
export { OAUTH_PROFILE_FLAG }
