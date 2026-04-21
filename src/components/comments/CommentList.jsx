function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="status-text">No comments yet. Be the first to comment.</p>
  }

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <article key={comment.id} className="comment-card">
          <p>{comment.content}</p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
        </article>
      ))}
    </div>
  )
}

export default CommentList
