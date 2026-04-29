import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommentForm from '../components/comments/CommentForm'
import CommentList from '../components/comments/CommentList'
import PostSummaryCard from '../components/posts/PostSummaryCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { createComment, fetchComments } from '../services/comments'
import {
  deletePost,
  fetchPostById,
  fetchPostThreadRef,
  upvotePost,
} from '../services/posts'
import { generatePostSummary } from '../services/summary'
import { formatRelativeTime } from '../utils/time'
import { getInitials } from '../utils/user'

function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [post, setPost] = useState(null)
  const [repostParent, setRepostParent] = useState(null)
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryError, setSummaryError] = useState('')
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

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

        if (postData.repost_of_post_id) {
          const parent = await fetchPostThreadRef(postData.repost_of_post_id)
          setRepostParent(parent)
        } else {
          setRepostParent(null)
        }
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

  async function handleGenerateSummary() {
    if (!post) return
    setSummaryError('')
    setIsSummaryLoading(true)

    try {
      const payload = {
        title: post.title,
        description: post.content ?? '',
        upvotes: post.upvotes_count ?? 0,
        comments: comments.map((comment) => comment.content),
        posts: [
          {
            id: post.id,
            title: post.title,
            content: post.content ?? '',
            upvotes: post.upvotes_count ?? 0,
            commentsCount: comments.length,
            flag: post.flag,
            repostOf: post.repost_of_post_id,
          },
        ],
      }

      const result = await generatePostSummary(payload)
      setSummary(result?.summary ?? 'No summary returned.')
      setSummaryError(result?.warning ?? '')
    } catch (summaryLoadError) {
      setSummaryError(
        summaryLoadError.message ??
          'Could not generate summary. Confirm your Edge Function is deployed.',
      )
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const flagLabel = post?.flag ? post.flag.replace(/^\w/, (c) => c.toUpperCase()) : ''

  return (
    <section className="page-section">
      {isLoading ? <LoadingSpinner label="Loading post..." /> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!isLoading && !error && post ? (
        <>
          <div className="post-detail-head">
            <h2>{post.title}</h2>
            {post.flag ? <span className="post-flag detail">{flagLabel}</span> : null}
          </div>

          <div className="post-author-row detail">
            {post.author_avatar_url ? (
              <img className="avatar-sm" src={post.author_avatar_url} alt={post.author_name} />
            ) : (
              <span className="avatar-sm avatar-fallback">{getInitials(post.author_name)}</span>
            )}
            <span className="post-author-name">{post.author_name}</span>
            <span className="dot-sep">•</span>
            <span>{formatRelativeTime(post.created_at)}</span>
          </div>

          {post.repost_of_post_id && repostParent ? (
            <div className="repost-thread-card">
              <p className="repost-thread-label">Part of a thread — replying to</p>
              <Link to={`/posts/${repostParent.id}`} className="repost-thread-link">
                {repostParent.title}
              </Link>
            </div>
          ) : null}
          {post.repost_of_post_id && !repostParent ? (
            <p className="status-text">Referenced post was removed or is unavailable.</p>
          ) : null}

          <p className="post-meta-line">Upvotes: {post.upvotes_count}</p>

          {post.content ? <p className="post-body">{post.content}</p> : null}
          {post.image_url ? (
            <img className="post-image" src={post.image_url} alt={post.title} />
          ) : null}

          <div className="button-row">
            <button className="button-link" type="button" onClick={handleUpvote}>
              Upvote
            </button>

            <Link
              to={`/posts/new?repost=${encodeURIComponent(post.id)}`}
              className="button-link secondary"
            >
              Repost / quote
            </Link>

            {isOwner ? (
              <>
                <Link to={`/posts/${postId}/edit`} className="button-link secondary">
                  Edit Post
                </Link>
                <button className="button-link danger" type="button" onClick={handleDelete}>
                  Delete Post
                </button>
              </>
            ) : null}
          </div>

          {actionError ? <p className="form-error section-gap">{actionError}</p> : null}

          <section className="comments-section">
            <h3>Comments</h3>
            {isLoggedIn ? (
              <CommentForm onSubmit={handleCreateComment} isSubmitting={isCommentSubmitting} />
            ) : (
              <p className="status-text">Login to leave a comment.</p>
            )}
            <CommentList comments={comments} />
          </section>

          <PostSummaryCard
            summary={summary}
            isGenerating={isSummaryLoading}
            onGenerate={handleGenerateSummary}
            error={summaryError}
            hasContentToSummarize={Boolean(post.content?.trim() || comments.length)}
          />
        </>
      ) : null}
    </section>
  )
}

export default PostDetailPage
