import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FeedToolbar from '../components/posts/FeedToolbar'
import PostCard from '../components/posts/PostCard'
import usePostQueryState from '../hooks/usePostQueryState'
import { fetchPosts } from '../services/posts'

function HomeFeedPage() {
  const { queryState, updateQueryState } = usePostQueryState()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true)
        setError('')
        const data = await fetchPosts({
          searchTerm: queryState.search,
          sortBy: queryState.sortBy,
        })
        setPosts(data)
      } catch (loadError) {
        setError(loadError.message ?? 'Unable to load posts.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [queryState.search, queryState.sortBy])

  return (
    <section className="page-section">
      <h2>Home Feed</h2>
      <p>Latest discussions from the Music Hub community.</p>
      <FeedToolbar
        search={queryState.search}
        sortBy={queryState.sortBy}
        onSearchChange={(nextSearch) =>
          updateQueryState({ search: nextSearch, sortBy: queryState.sortBy })
        }
        onSortChange={(nextSortBy) =>
          updateQueryState({ search: queryState.search, sortBy: nextSortBy })
        }
        onReset={() => updateQueryState({ search: '', sortBy: 'created_at' })}
      />

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
