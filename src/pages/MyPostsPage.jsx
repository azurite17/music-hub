import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import emptyFeed from '../assets/emptyFeed.jpg'
import PageBanner from '../components/layout/PageBanner'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { usePreferences } from '../hooks/usePreferences'
import { fetchPostsByAuthor } from '../services/posts'

function MyPostsPage() {
  const { user } = useAuth()
  const { feedRich } = usePreferences()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return
    async function load() {
      try {
        setIsLoading(true)
        setError('')
        const data = await fetchPostsByAuthor(user.id)
        setPosts(data)
      } catch (e) {
        setError(e.message ?? 'Could not load your posts.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id])

  return (
    <section className="page-section">
      <PageBanner title="My Posts" subtitle="Posts you have published." />

      {isLoading ? <LoadingSpinner label="Loading your posts..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error && posts.length === 0 ? (
        <div className="placeholder-card">
          <img className="empty-feed-image" src={emptyFeed} alt="No posts yet" />
          <p className="status-text">You have not created any posts yet.</p>
          <Link to="/posts/new" className="button-link">
            Create your first post
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

export default MyPostsPage
