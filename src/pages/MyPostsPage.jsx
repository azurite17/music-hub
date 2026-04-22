import { useEffect, useState } from 'react'
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
      <h2>My Posts</h2>
      <p>Posts you have published.</p>

      {isLoading ? <LoadingSpinner label="Loading your posts..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error && posts.length === 0 ? (
        <p className="status-text">You have not created any posts yet.</p>
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
