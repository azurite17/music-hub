import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommentForm from '../components/comments/CommentForm'
import CommentList from '../components/comments/CommentList'
import { supabase } from '../lib/supabaseClient'
import { createComment, fetchComments } from '../services/comments'
import { deletePost, fetchPostById, upvotePost } from '../services/posts'

function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    async function loadDetail() {
      try {
        setIsLoading(true)
        setError('')
        const [postData, commentData, authData] = await Promise.all([
          fetchPostById(postId),
          fetchComments(postId),
          supabase.auth.getUser(),
        ])
        setPost(postData)
        setComments(commentData)
        setIsOwner(authData?.data?.user?.id === postData.author_id)
      } catch (loadError) {
        setError(loadError.message ?? 'Unable to load this post.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDetail()
  }, [postId])

  async function handleUpvote() {
    if (!post) return
    setActionError('')
    try {
      const updated = await upvotePost(post.id)
      setPost((prev) => (prev ? { ...prev, upvotes_count: updated.upvotes_count } : prev))
    } catch (upvoteError) {
      setActionError(upvoteError.message ?? 'Unable to upvote right now.')
    }
  }

  async function handleDelete() {
    if (!post) return
    const confirmed = window.confirm('Delete this post permanently?')
    if (!confirmed) return

    setActionError('')
    try {
      await deletePost(post.id)
      navigate('/')
    } catch (deleteError) {
      setActionError(deleteError.message ?? 'Unable to delete post.')
    }
  }

  async function handleCreateComment(content) {
    setIsCommentSubmitting(true)
    setActionError('')
    try {
      await createComment(postId, content)
      const latestComments = await fetchComments(postId)
      setComments(latestComments)
    } catch (commentError) {
      setActionError(commentError.message ?? 'Unable to add comment.')
      throw commentError
    } finally {
      setIsCommentSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      {isLoading ? <p className="status-text">Loading post...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error && post ? (
        <>
          <h2>{post.title}</h2>
          <p className="post-meta-line">
            Posted on {new Date(post.created_at).toLocaleString()}
          </p>
          <p className="post-meta-line">Upvotes: {post.upvotes_count}</p>

          {post.content ? <p className="post-body">{post.content}</p> : null}
          {post.image_url ? (
            <img className="post-image" src={post.image_url} alt={post.title} />
          ) : null}

          <div className="button-row">
            <button className="button-link" type="button" onClick={handleUpvote}>
              Upvote
            </button>

            {isOwner ? (
              <>
                <Link to={`/posts/${postId}/edit`} className="button-link secondary">
                  Edit Post
                </Link>
                <button
                  className="button-link danger"
                  type="button"
                  onClick={handleDelete}
                >
                  Delete Post
                </button>
              </>
            ) : null}
          </div>

          {actionError ? <p className="form-error section-gap">{actionError}</p> : null}

          <section className="comments-section">
            <h3>Comments</h3>
            <CommentForm
              onSubmit={handleCreateComment}
              isSubmitting={isCommentSubmitting}
            />
            <CommentList comments={comments} />
          </section>
        </>
      ) : null}
    </section>
  )
}

export default PostDetailPage
