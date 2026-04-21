import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

function SettingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <section className="page-section">
      <h2>Settings</h2>
      <p>Theme and feed preference controls will be added in a later stage.</p>

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
