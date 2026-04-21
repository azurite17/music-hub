import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PostForm from '../components/posts/PostForm'
import { fetchPostById, updatePost } from '../services/posts'

function EditPostPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [initialValues, setInitialValues] = useState({
    title: '',
    content: '',
    imageUrl: '',
  })

  useEffect(() => {
    async function loadPost() {
      try {
        setIsLoading(true)
        const post = await fetchPostById(postId)
        setInitialValues({
          title: post.title ?? '',
          content: post.content ?? '',
          imageUrl: post.image_url ?? '',
        })
      } catch (loadError) {
        setError(loadError.message ?? 'Unable to load post for editing.')
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [postId])

  async function handleSubmit(formData) {
    setIsSubmitting(true)
    setError('')
    try {
      await updatePost(postId, formData)
      navigate(`/posts/${postId}`)
    } catch (saveError) {
      setError(saveError.message ?? 'Unable to update this post.')
      throw saveError
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <h2>Edit Post</h2>
      {isLoading ? <p className="status-text">Loading editor...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {!isLoading ? (
        <PostForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          initialValues={initialValues}
          submitLabel="Save changes"
          submittingLabel="Saving..."
        />
      ) : null}
    </section>
  )
}

export default EditPostPage
