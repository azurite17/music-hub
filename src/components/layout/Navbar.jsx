import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

const navItems = [
  { to: '/', label: 'Home Feed', end: true },
  { to: '/posts/new', label: 'Create Post' },
  { to: '/my-posts', label: 'My Posts' },
  { to: '/settings', label: 'Settings' },
  { to: '/auth', label: 'Login / Signup' },
]

function Navbar() {
  const { isLoggedIn, user } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="site-header">
      <div className="site-branding">
        <h1>Music Hub</h1>
        <p>Your space for music conversations.</p>
        <p className="auth-indicator">
          {isLoggedIn ? `Signed in: ${user?.email}` : 'Not logged in'}
        </p>
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
