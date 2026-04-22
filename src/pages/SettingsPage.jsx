import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePreferences } from '../hooks/usePreferences'
import { supabase } from '../lib/supabaseClient'

const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'warm', label: 'Warm' },
  { id: 'dark', label: 'Dark' },
]

function SettingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const { theme, setTheme, feedRich, setFeedRich } = usePreferences()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <section className="page-section">
      <h2>Settings</h2>
      <p>Customize how Music Hub looks and what you see on the feed.</p>

      <section className="settings-block">
        <h3>Appearance</h3>
        <label className="form-field">
          <span>Color theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="settings-block">
        <h3>Home feed</h3>
        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={feedRich}
            onChange={(e) => setFeedRich(e.target.checked)}
          />
          <span>Show post preview text and images on the home feed</span>
        </label>
      </section>

      <section className="account-panel">
        <h3>Account</h3>
        <p className="status-text">
          {isLoggedIn ? `Logged in as ${user?.email}` : 'You are not logged in.'}
        </p>
        {isLoggedIn ? (
          <button className="button-link danger" type="button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className="button-link" type="button" onClick={() => navigate('/auth')}>
            Go to login / signup
          </button>
        )}
      </section>
    </section>
  )
}

export default SettingsPage
