import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import defaultAvatar1 from '../../assets/defaultAvatar1.jpg'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { getCurrentProfile } from '../../services/profiles'
import { getAvatarVariantClass, getDisplayName, getInitials } from '../../utils/user'

function Navbar() {
  const { isLoggedIn, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const displayName = getDisplayName({ profile, user, fallbackId: user?.id })
  const avatarUrl = profile?.avatar_url?.trim() || ''
  const avatarVariant = getAvatarVariantClass(displayName)
  const navItems = useMemo(() => {
    const baseItems = [
      { to: '/', label: 'Home Feed', end: true },
      { to: '/posts/new', label: 'Create Post' },
      { to: '/my-posts', label: 'My Posts' },
    ]
    if (isLoggedIn) {
      baseItems.push({ to: '/settings', label: 'Settings' })
    }
    if (!isLoggedIn) {
      baseItems.push({ to: '/auth', label: 'Login / Signup' })
    }
    return baseItems
  }, [isLoggedIn])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    let isCancelled = false

    async function loadProfile() {
      if (!isLoggedIn) {
        setProfile(null)
        return
      }
      try {
        const nextProfile = await getCurrentProfile()
        if (!isCancelled) {
          setProfile(nextProfile)
        }
      } catch {
        if (!isCancelled) {
          setProfile(null)
        }
      }
    }

    loadProfile()
    function handleProfileUpdated() {
      loadProfile()
    }
    window.addEventListener('profile-updated', handleProfileUpdated)
    return () => {
      isCancelled = true
      window.removeEventListener('profile-updated', handleProfileUpdated)
    }
  }, [isLoggedIn])

  return (
    <header className="site-header">
      <div className="site-branding">
        <h1>MUSIC HUB</h1>
        <p>Your space for music conversations.</p>
        <div className="auth-indicator-row">
          <Link to={isLoggedIn && user?.id ? `/users/${user.id}` : '/auth'} className="profile-link-row">
            {avatarUrl ? (
              <img className="avatar-sm nav-avatar" src={avatarUrl} alt={displayName} />
            ) : (
              <span className={`avatar-stack nav-avatar ${avatarVariant}`}>
                <img className="avatar-sm avatar-default" src={defaultAvatar1} alt={displayName} />
                <span className="avatar-sm avatar-fallback nav-avatar">{getInitials(displayName)}</span>
              </span>
            )}
            <p className="auth-indicator">
              {isLoggedIn ? `Signed in: ${displayName}` : 'Not logged in'}
            </p>
          </Link>
        </div>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
        {isLoggedIn ? (
          <button type="button" className="nav-link nav-button" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
      </nav>
    </header>
  )
}

export default Navbar
