import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import emptyFeed from '../assets/emptyFeed.jpg'
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
            genreFilter: queryState.genre,
            genreSearch: queryState.genreSearch,
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
  }, [queryState.search, queryState.sortBy, queryState.flag, queryState.genre, queryState.genreSearch])

  return (
    <section className="page-section feed-shell">
      <div className="feed-layout">
        <aside className="feed-sidebar sticky-rail">
          <FeedToolbar
            search={queryState.search}
            genreSearch={queryState.genreSearch}
            sortBy={queryState.sortBy}
            flag={queryState.flag}
            genre={queryState.genre}
            onSearchChange={(nextSearch) =>
              updateQueryState({
                search: nextSearch,
                genreSearch: queryState.genreSearch,
                sortBy: queryState.sortBy,
                flag: queryState.flag,
                genre: queryState.genre,
              })
            }
            onGenreSearchChange={(nextGenreSearch) =>
              updateQueryState({
                search: queryState.search,
                genreSearch: nextGenreSearch,
                sortBy: queryState.sortBy,
                flag: queryState.flag,
                genre: queryState.genre,
              })
            }
            onSortChange={(nextSortBy) =>
              updateQueryState({
                search: queryState.search,
                genreSearch: queryState.genreSearch,
                sortBy: nextSortBy,
                flag: queryState.flag,
                genre: queryState.genre,
              })
            }
            onFlagChange={(nextFlag) =>
              updateQueryState({
                search: queryState.search,
                genreSearch: queryState.genreSearch,
                sortBy: queryState.sortBy,
                flag: nextFlag,
                genre: queryState.genre,
              })
            }
            onGenreChange={(nextGenre) =>
              updateQueryState({
                search: queryState.search,
                genreSearch: queryState.genreSearch,
                sortBy: queryState.sortBy,
                flag: queryState.flag,
                genre: nextGenre,
              })
            }
            onReset={() =>
              updateQueryState({
                search: '',
                genreSearch: '',
                sortBy: 'created_at',
                flag: 'all',
                genre: 'all',
              })
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
              <img className="empty-feed-image" src={emptyFeed} alt="No posts in feed" />
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
