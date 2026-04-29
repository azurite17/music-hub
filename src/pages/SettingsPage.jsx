import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import { getCurrentProfile, upsertCurrentProfile } from '../services/profiles'
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

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    let cancelled = false

    async function loadProfile() {
      try {
        const profile = await getCurrentProfile()
        if (cancelled || !profile) return
        setDisplayName(profile.display_name || '')
        setAvatarUrl(profile.avatar_url || '')
      } catch {
        if (!cancelled) {
          setDisplayName('')
          setAvatarUrl('')
        }
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  async function handleProfileSave(event) {
    event.preventDefault()
    setProfileMessage('')
    setProfileError('')
    setIsSavingProfile(true)

    try {
      await upsertCurrentProfile({ displayName, avatarUrl })
      setProfileMessage('Profile saved.')
    } catch (error) {
      setProfileError(error.message ?? 'Could not save profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <section className="page-section">
      <PageBanner
        title="Settings"
        subtitle="Customize how Music Hub looks and how your profile appears."
      />

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

      <section className="settings-block">
        <h3>Profile</h3>
        {!isLoggedIn ? (
          <p className="status-text">Login to customize your username and avatar.</p>
        ) : (
          <form className="post-form" onSubmit={handleProfileSave}>
            <label className="form-field">
              <span>Username</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Pick your display name"
                maxLength={40}
              />
            </label>

            <label className="form-field">
              <span>Profile photo URL</span>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
            </label>

            {profileError ? <p className="form-error">{profileError}</p> : null}
            {profileMessage ? <p className="form-success">{profileMessage}</p> : null}

            <button className="button-link" type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        )}
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
