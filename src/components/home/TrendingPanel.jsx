import { Link } from 'react-router-dom'

function TrendingPanel({ posts }) {
  return (
    <section className="sidebar-card">
      <h3>Trending</h3>
      {posts.length === 0 ? (
        <p className="status-text">Not enough activity yet.</p>
      ) : (
        <ul className="trending-list">
          {posts.map((post) => (
            <li key={post.id}>
              <Link to={`/posts/${post.id}`} className="trending-link">
                {post.title}
              </Link>
              <span className="trending-meta">
                {post.upvotes_count} upvotes · {post.comments_count ?? 0} comments
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TrendingPanel
