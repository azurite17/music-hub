import { Link } from 'react-router-dom'

function excerpt(text, max = 160) {
  if (!text?.trim()) return ''
  const t = text.trim()
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

function PostCard({ post, feedRich = false }) {
  const createdAt = new Date(post.created_at).toLocaleString()
  const flagLabel = post.flag ? post.flag.replace(/^\w/, (c) => c.toUpperCase()) : ''

  return (
    <article className="post-card">
      <div className="post-card-top">
        <h3>
          <Link to={`/posts/${post.id}`} className="post-title-link">
            {post.title}
          </Link>
        </h3>
        {post.flag ? <span className="post-flag">{flagLabel}</span> : null}
      </div>
      <div className="post-meta">
        <span>Created: {createdAt}</span>
        <span>Upvotes: {post.upvotes_count}</span>
        {post.repost_of_post_id ? (
          <span className="repost-badge">Repost</span>
        ) : null}
      </div>
      {feedRich && post.content ? (
        <p className="post-card-preview">{excerpt(post.content)}</p>
      ) : null}
      {feedRich && post.image_url ? (
        <img
          className="post-card-thumb"
          src={post.image_url}
          alt=""
          loading="lazy"
        />
      ) : null}
    </article>
  )
}

export default PostCard
