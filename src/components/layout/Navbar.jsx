import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home Feed', end: true },
  { to: '/posts/new', label: 'Create Post' },
  { to: '/my-posts', label: 'My Posts' },
  { to: '/settings', label: 'Settings' },
  { to: '/auth', label: 'Login / Signup' },
]

function Navbar() {
  return (
    <header className="site-header">
      <div className="site-branding">
        <h1>Music Hub</h1>
        <p>Your space for music conversations.</p>
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
      </nav>
    </header>
  )
}

export default Navbar
