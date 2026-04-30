import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import { getCurrentProfile, upsertCurrentProfile } from '../services/profiles'
import { uploadProfileAvatar } from '../services/postImages'
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
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [favoriteGenres, setFavoriteGenres] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarFileInputKey, setAvatarFileInputKey] = useState(0)

  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) return null
    return URL.createObjectURL(avatarFile)
  }, [avatarFile])

  useEffect(() => {
    if (!avatarPreviewUrl) return
    return () => URL.revokeObjectURL(avatarPreviewUrl)
  }, [avatarPreviewUrl])

  useEffect(() => {
    if (!isLoggedIn) return
    let cancelled = false

    async function loadProfile() {
      try {
        const profile = await getCurrentProfile()
        if (cancelled || !profile) return
        setDisplayName(profile.display_name || '')
        setAvatarUrl(profile.avatar_url || '')
        setBio(profile.bio || '')
        setLocation(profile.location || '')
        setFavoriteGenres(profile.favorite_genres || '')
        setInstagramUrl(profile.instagram_url || '')
        setSpotifyUrl(profile.spotify_url || '')
      } catch {
        if (!cancelled) {
          setDisplayName('')
          setAvatarUrl('')
          setBio('')
          setLocation('')
          setFavoriteGenres('')
          setInstagramUrl('')
          setSpotifyUrl('')
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
      let finalAvatarUrl = avatarUrl.trim()
      if (avatarFile) {
        finalAvatarUrl = await uploadProfileAvatar(avatarFile)
        setAvatarUrl(finalAvatarUrl)
      }
      await upsertCurrentProfile({
        displayName,
        avatarUrl: finalAvatarUrl,
        bio,
        location,
        favoriteGenres,
        instagramUrl,
        spotifyUrl,
      })
      setAvatarFile(null)
      setAvatarFileInputKey((k) => k + 1)
      window.dispatchEvent(new Event('profile-updated'))
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

            <div className="form-field settings-avatar-field">
              <span>Profile photo</span>
              {(avatarPreviewUrl || avatarUrl.trim()) && (
                <div className="settings-avatar-preview-wrap">
                  <img
                    className="settings-avatar-preview"
                    src={avatarPreviewUrl || avatarUrl.trim()}
                    alt=""
                  />
                </div>
              )}
              <label className="image-file-label">
                <span className="image-file-label-text">Upload from device</span>
                <input
                  key={avatarFileInputKey}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setProfileError('')
                    setAvatarFile(file)
                    setAvatarUrl('')
                  }}
                  className="image-file-input"
                />
              </label>
              <small className="field-hint">JPEG, PNG, WebP, or GIF — up to 2 MB. Uses the same Storage bucket as post images.</small>
              {avatarFile ? (
                <button
                  type="button"
                  className="button-link secondary"
                  onClick={() => {
                    setAvatarFile(null)
                    setAvatarFileInputKey((k) => k + 1)
                  }}
                >
                  Remove selected file
                </button>
              ) : null}
              <div className="image-url-nested">
                <span className="image-url-nested-label">Or paste image URL</span>
                <input
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value)
                    setAvatarFile(null)
                    setAvatarFileInputKey((k) => k + 1)
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                  disabled={Boolean(avatarFile)}
                />
              </div>
            </div>

            <label className="form-field">
              <span>About me (optional)</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people what kind of music you like."
                maxLength={320}
                rows={4}
              />
            </label>

            <label className="form-field">
              <span>Location (optional)</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, country, or online"
                maxLength={80}
              />
            </label>

            <label className="form-field">
              <span>Music genres you&apos;re into (optional)</span>
              <input
                value={favoriteGenres}
                onChange={(e) => setFavoriteGenres(e.target.value)}
                placeholder="e.g. indie, R&B, house, metal — commas or semicolons"
                maxLength={120}
              />
              <small className="field-hint">Separate genres with commas or semicolons. Shown as tags on your profile.</small>
            </label>

            <label className="form-field">
              <span>Instagram URL (optional)</span>
              <input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourname"
                type="url"
              />
            </label>

            <label className="form-field">
              <span>Spotify URL (optional)</span>
              <input
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/user/..."
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
