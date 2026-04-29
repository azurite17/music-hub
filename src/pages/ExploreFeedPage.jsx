import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { usePreferences } from '../hooks/usePreferences'
import { fetchPosts } from '../services/posts'

function ExploreFeedPage() {
  const { feedRich } = usePreferences()
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  function shuffle(list) {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true)
        setError('')
        const data = await fetchPosts({
          sortBy: 'created_at',
          flagFilter: 'all',
        })
        setPosts(shuffle(data))
      } catch (loadError) {
        setError(loadError.message ?? 'Unable to load explore feed.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  const visiblePosts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((post) => post.title.toLowerCase().includes(q))
  }, [posts, search])

  return (
    <section className="page-section feed-shell explore-shell">
      <PageBanner
        title="Explore Feed"
        subtitle="Random discoveries from across the Music Hub community."
      />

      <label className="form-field explore-search">
        <span>Quick search</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search in explore..."
        />
      </label>

      {isLoading ? <LoadingSpinner label="Loading explore feed..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error && visiblePosts.length === 0 ? (
        <div className="placeholder-card">
          <p>No matching posts yet.</p>
          <Link to="/posts/new" className="button-link">
            Start a new discussion
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && visiblePosts.length > 0 ? (
        <div className="post-list">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} feedRich={feedRich} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default ExploreFeedPage
