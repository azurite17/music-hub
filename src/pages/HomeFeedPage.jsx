import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/posts/PostCard'
import { fetchPosts } from '../services/posts'

function HomeFeedPage() {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true)
        const data = await fetchPosts()
        setPosts(data)
      } catch (loadError) {
        setError(loadError.message ?? 'Unable to load posts.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <section className="page-section">
      <h2>Home Feed</h2>
      <p>Latest discussions from the Music Hub community.</p>

      {isLoading ? <p className="status-text">Loading posts...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error && posts.length === 0 ? (
        <div className="placeholder-card">
          <p>No posts yet. Start the conversation.</p>
          <Link to="/posts/new" className="button-link">
            Create your first post
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && posts.length > 0 ? (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default HomeFeedPage
