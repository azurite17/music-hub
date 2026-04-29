import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { getDisplayName, getInitials } from '../../utils/user'

function Navbar() {
  const { isLoggedIn, user } = useAuth()
  const displayName = getDisplayName({ user, fallbackId: user?.id })
  const navItems = useMemo(() => {
    const baseItems = [
      { to: '/', label: 'Home Feed', end: true },
      { to: '/explore', label: 'Explore' },
      { to: '/posts/new', label: 'Create Post' },
      { to: '/my-posts', label: 'My Posts' },
      { to: '/settings', label: 'Settings' },
    ]
    if (!isLoggedIn) {
      baseItems.push({ to: '/auth', label: 'Login / Signup' })
    }
    return baseItems
  }, [isLoggedIn])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="site-header">
      <div className="site-branding">
        <h1>Music Hub</h1>
        <p>Your space for music conversations.</p>
        <div className="auth-indicator-row">
          <span className="avatar-sm avatar-fallback nav-avatar">{getInitials(displayName)}</span>
          <p className="auth-indicator">
            {isLoggedIn ? `Signed in: ${displayName}` : 'Not logged in'}
          </p>
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
