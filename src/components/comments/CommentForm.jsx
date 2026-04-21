import { useState } from 'react'

function CommentForm({ onSubmit, isSubmitting }) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed) {
      setError('Comment cannot be empty.')
      return
    }

    setError('')
    try {
      await onSubmit(trimmed)
      setComment('')
    } catch (submitError) {
      setError(submitError.message ?? 'Unable to post comment.')
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={4}
        placeholder="Join the discussion..."
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button-link" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}

export default CommentForm
