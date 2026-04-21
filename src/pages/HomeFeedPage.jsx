import { Link } from 'react-router-dom'

function HomeFeedPage() {
  return (
    <section className="page-section">
      <h2>Home Feed</h2>
      <p>Posts will appear here in Stage 2 with search and sorting controls.</p>
      <div className="placeholder-card">
        <p>No posts yet. Start the conversation.</p>
        <Link to="/posts/new" className="button-link">
          Create your first post
        </Link>
      </div>
    </section>
  )
}

export default HomeFeedPage
