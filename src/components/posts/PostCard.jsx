import { Link } from 'react-router-dom'

function PostCard({ post }) {
  const createdAt = new Date(post.created_at).toLocaleString()

  return (
    <article className="post-card">
      <h3>
        <Link to={`/posts/${post.id}`} className="post-title-link">
          {post.title}
        </Link>
      </h3>
      <div className="post-meta">
        <span>Created: {createdAt}</span>
        <span>Upvotes: {post.upvotes_count}</span>
      </div>
    </article>
  )
}

export default PostCard
