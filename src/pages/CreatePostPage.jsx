import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PostForm from '../components/posts/PostForm'
import { createPost } from '../services/posts'

function CreatePostPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  async function handleCreatePost(formData) {
    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      const createdPost = await createPost(formData)
      setSuccessMessage('Post published successfully.')
      navigate(`/posts/${createdPost.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <h2>Create Post</h2>
      <p>Share a music thought, recommendation, or hot take.</p>
      {successMessage ? <p className="form-success">{successMessage}</p> : null}
      <PostForm onSubmit={handleCreatePost} isSubmitting={isSubmitting} />
    </section>
  )
}

export default CreatePostPage
