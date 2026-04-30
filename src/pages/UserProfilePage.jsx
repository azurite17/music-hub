import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import defaultAvatar1 from '../assets/defaultAvatar1.jpg'
import emptyFeed from '../assets/emptyFeed.jpg'
import PageBanner from '../components/layout/PageBanner'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { usePreferences } from '../hooks/usePreferences'
import { fetchPostsByAuthor } from '../services/posts'
import { fetchPublicProfile } from '../services/profiles'
import { parseGenreTags } from '../utils/genres'
import { getAvatarVariantClass, getDisplayName, getInitials } from '../utils/user'

function UserProfilePage() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const { feedRich } = usePreferences()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      try {
        setIsLoading(true)
        setError('')
        const [profileData, postData] = await Promise.all([
          fetchPublicProfile(userId),
          fetchPostsByAuthor(userId),
        ])
        if (cancelled) return
        setProfile(profileData)
        setPosts(postData)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message ?? 'Could not load this profile.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const displayName = getDisplayName({ profile, fallbackId: userId })
  const avatarUrl = profile?.avatar_url?.trim() || ''
  const avatarVariant = getAvatarVariantClass(displayName)
  const genreTags = parseGenreTags(profile?.favorite_genres)
  const isOwnProfile = Boolean(currentUser?.id && userId === currentUser.id)

  return (
    <section className="page-section">
      <PageBanner title={`${displayName}'s profile`} subtitle="Community member profile and posts." />

      {isLoading ? <LoadingSpinner label="Loading profile..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error ? (
        <section className="profile-overview-card">
          {avatarUrl ? (
            <img className="avatar-lg" src={avatarUrl} alt={displayName} />
          ) : (
            <span className={`avatar-stack avatar-lg ${avatarVariant}`}>
              <img className="avatar-lg avatar-default" src={defaultAvatar1} alt={displayName} />
              <span className="avatar-lg avatar-fallback">{getInitials(displayName)}</span>
            </span>
          )}
          <div className="profile-overview-text">
            <h3>{displayName}</h3>
            {isOwnProfile ? (
              <p className="profile-own-hint">
                Want to update your photo, bio, or genres?{' '}
                <Link to="/settings">Open Settings</Link>.
              </p>
            ) : null}
            {profile?.location ? <p>Location: {profile.location}</p> : null}
            {genreTags.length > 0 ? (
              <div className="profile-genre-block">
                <span className="profile-genre-label">Music I&apos;m into</span>
                <ul className="profile-genre-chips" aria-label="Music genres">
                  {genreTags.map((tag, index) => (
                    <li key={`${tag}-${index}`}>{tag}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {profile?.bio ? <p>{profile.bio}</p> : <p className="status-text">No bio added yet.</p>}
            <div className="profile-links-row">
              {profile?.instagram_url ? (
                <a href={profile.instagram_url} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              ) : null}
              {profile?.spotify_url ? (
                <a href={profile.spotify_url} target="_blank" rel="noreferrer">
                  Spotify
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && posts.length === 0 ? (
        <div className="placeholder-card">
          <img className="empty-feed-image" src={emptyFeed} alt="No posts from this user" />
          <p>This user has not posted yet.</p>
          <Link to="/" className="button-link">
            Browse home feed
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && posts.length > 0 ? (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} feedRich={feedRich} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default UserProfilePage
