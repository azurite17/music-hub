import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../../utils/time'
import { getInitials } from '../../utils/user'

function excerpt(text, max = 160) {
  if (!text?.trim()) return ''
  const t = text.trim()
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

function PostCard({ post, feedRich = false }) {
  const flagLabel = post.flag ? post.flag.replace(/^\w/, (c) => c.toUpperCase()) : ''
  const authorName = post.author_name || 'music-fan'
  const initials = getInitials(authorName)

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

      <div className="post-author-row">
        {post.author_avatar_url ? (
          <img className="avatar-sm" src={post.author_avatar_url} alt={authorName} />
        ) : (
          <span className="avatar-sm avatar-fallback">{initials}</span>
        )}
        <span className="post-author-name">{authorName}</span>
        <span className="dot-sep">•</span>
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>

      <div className="post-meta">
        <span>Upvotes: {post.upvotes_count}</span>
        <span>Comments: {post.comments_count ?? 0}</span>
        {post.repost_of_post_id ? <span className="repost-badge">Repost</span> : null}
      </div>

      {feedRich && post.content ? <p className="post-card-preview">{excerpt(post.content)}</p> : null}
      {feedRich && post.image_url ? (
        <img className="post-card-thumb" src={post.image_url} alt="" loading="lazy" />
      ) : null}
    </article>
  )
}

export default PostCard
