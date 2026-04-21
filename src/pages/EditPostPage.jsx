import { useParams } from 'react-router-dom'

function EditPostPage() {
  const { postId } = useParams()

  return (
    <section className="page-section">
      <h2>Edit Post</h2>
      <p>Edit form for post ID {postId} will be implemented in Stage 3.</p>
    </section>
  )
}

export default EditPostPage
