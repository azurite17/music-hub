import { Link, useParams } from 'react-router-dom'

function PostDetailPage() {
  const { postId } = useParams()

  return (
    <section className="page-section">
      <h2>Post Detail</h2>
      <p>Viewing post ID: {postId}</p>
      <p>Content, upvotes, and comments are added in Stage 3.</p>
      <div className="button-row">
        <Link to={`/posts/${postId}/edit`} className="button-link secondary">
          Edit Post
        </Link>
      </div>
    </section>
  )
}

export default PostDetailPage
