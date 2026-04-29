import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TrendingPanel from '../components/home/TrendingPanel'
import PageBanner from '../components/layout/PageBanner'
import FeedToolbar from '../components/posts/FeedToolbar'
import PostCard from '../components/posts/PostCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { usePreferences } from '../hooks/usePreferences'
import usePostQueryState from '../hooks/usePostQueryState'
import { fetchPosts, fetchTrendingPosts } from '../services/posts'

function HomeFeedPage() {
  const { queryState, updateQueryState } = usePostQueryState()
  const { feedRich } = usePreferences()

  const [posts, setPosts] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true)
        setError('')
        const [data, trending] = await Promise.all([
          fetchPosts({
            searchTerm: queryState.search,
            sortBy: queryState.sortBy,
            flagFilter: queryState.flag,
          }),
          fetchTrendingPosts(6),
        ])
        setPosts(data)
        setTrendingPosts(trending)
      } catch (loadError) {
        setError(loadError.message ?? 'Unable to load posts.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [queryState.search, queryState.sortBy, queryState.flag])

  return (
    <section className="page-section feed-shell">
      <div className="feed-layout">
        <aside className="feed-sidebar sticky-rail">
          <FeedToolbar
            search={queryState.search}
            sortBy={queryState.sortBy}
            flag={queryState.flag}
            onSearchChange={(nextSearch) =>
              updateQueryState({
                search: nextSearch,
                sortBy: queryState.sortBy,
                flag: queryState.flag,
              })
            }
            onSortChange={(nextSortBy) =>
              updateQueryState({
                search: queryState.search,
                sortBy: nextSortBy,
                flag: queryState.flag,
              })
            }
            onFlagChange={(nextFlag) =>
              updateQueryState({
                search: queryState.search,
                sortBy: queryState.sortBy,
                flag: nextFlag,
              })
            }
            onReset={() =>
              updateQueryState({ search: '', sortBy: 'created_at', flag: 'all' })
            }
          />

          <TrendingPanel posts={trendingPosts} />
        </aside>

        <div className="feed-main">
          <PageBanner
            title="Home Feed"
            subtitle="Latest discussions from the Music Hub community."
          />

          {isLoading ? <LoadingSpinner label="Loading posts..." /> : null}
          {error ? <p className="form-error">{error}</p> : null}

          {!isLoading && !error && posts.length === 0 ? (
            <div className="placeholder-card">
              <p>No posts match your current filters yet.</p>
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
        </div>
      </div>
    </section>
  )
}

export default HomeFeedPage
