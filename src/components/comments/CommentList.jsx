import { formatRelativeTime } from '../../utils/time'
import { getInitials } from '../../utils/user'

function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="status-text">No comments yet. Be the first to comment.</p>
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => {
        const authorName = comment.author_name || 'music-fan'
        return (
          <article key={comment.id} className="comment-card">
            <div className="comment-head">
              {comment.author_avatar_url ? (
                <img className="avatar-sm" src={comment.author_avatar_url} alt={authorName} />
              ) : (
                <span className="avatar-sm avatar-fallback">{getInitials(authorName)}</span>
              )}
              <div>
                <strong>{authorName}</strong>
                <small>
                  {comment.relative_created_at || formatRelativeTime(comment.created_at)}
                </small>
              </div>
            </div>
            <p>{comment.content}</p>
          </article>
        )
      })}
    </div>
  )
}

export default CommentList
