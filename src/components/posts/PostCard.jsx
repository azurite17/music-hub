import { Link, useNavigate } from 'react-router-dom'
import defaultAvatar1 from '../../assets/defaultAvatar1.jpg'
import { formatRelativeTime } from '../../utils/time'
import { getAvatarVariantClass, getInitials } from '../../utils/user'

const FLAG_META = {
  question: { icon: '❓', className: 'flag-question' },
  opinion: { icon: '💬', className: 'flag-opinion' },
  recommendation: { icon: '🎧', className: 'flag-recommendation' },
  discussion: { icon: '🗣️', className: 'flag-discussion' },
  general: { icon: '🎵', className: 'flag-general' },
}

function excerpt(text, max = 160) {
  if (!text?.trim()) return ''
  const t = text.trim()
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

function PostCard({ post, feedRich = false }) {
  const navigate = useNavigate()
  const flagLabel = post.flag ? post.flag.replace(/^\w/, (c) => c.toUpperCase()) : ''
  const flagMeta = FLAG_META[post.flag] ?? FLAG_META.general
  const authorName = post.author_name || 'music-fan'
  const initials = getInitials(authorName)
  const avatarVariant = getAvatarVariantClass(authorName)

  function handleCardClick(event) {
    if (event.target.closest('a')) return
    navigate(`/posts/${post.id}`)
  }

  function handleCardKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (event.target.closest('a')) return
    event.preventDefault()
    navigate(`/posts/${post.id}`)
  }

  return (
    <article
      className="post-card post-card-clickable"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      aria-label={`Open post: ${post.title}`}
    >
      <div className="post-card-top">
        <h3>
          <Link to={`/posts/${post.id}`} className="post-title-link">
            {post.title}
          </Link>
        </h3>
        {post.flag ? (
          <span className={`post-flag ${flagMeta.className}`}>
            <span aria-hidden>{flagMeta.icon}</span> {flagLabel}
          </span>
        ) : null}
      </div>

      <div className="post-author-row">
        {post.author_avatar_url ? (
          <img className="avatar-sm" src={post.author_avatar_url} alt={authorName} />
        ) : (
          <span className={`avatar-stack ${avatarVariant}`}>
            <img className="avatar-sm avatar-default" src={defaultAvatar1} alt={authorName} />
            <span className="avatar-sm avatar-fallback">{initials}</span>
          </span>
        )}
        <Link to={`/users/${post.author_id}`} className="post-author-name">
          {authorName}
        </Link>
        <span className="dot-sep">•</span>
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>

      <div className="post-meta">
        <span>Upvotes: {post.upvotes_count}</span>
        <span>Comments: {post.comments_count ?? 0}</span>
        {post.repost_of_post_id ? <span className="repost-badge">Repost</span> : null}
      </div>

      {post.genres?.length ? (
        <ul className="post-card-genres" aria-label="Genres">
          {post.genres.map((g, index) => (
            <li key={`${g}-${index}`}>{g}</li>
          ))}
        </ul>
      ) : null}

      {feedRich && post.content ? <p className="post-card-preview">{excerpt(post.content)}</p> : null}
      {feedRich && post.image_url ? (
        <img className="post-card-thumb" src={post.image_url} alt="" loading="lazy" />
      ) : null}
    </article>
  )
}

export default PostCard
