import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import PostForm from '../components/posts/PostForm'
import { createPost, fetchPostThreadRef } from '../services/posts'

function CreatePostPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const repostId = searchParams.get('repost')?.trim() || null

  const [repostParentTitle, setRepostParentTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!repostId) {
        if (!cancelled) setRepostParentTitle('')
        return
      }
      try {
        const ref = await fetchPostThreadRef(repostId)
        if (!cancelled) setRepostParentTitle(ref?.title ?? '')
      } catch {
        if (!cancelled) setRepostParentTitle('')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [repostId])

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
      <PageBanner
        title="Create Post"
        subtitle="Share a music thought, recommendation, or hot take."
      />
      {successMessage ? <p className="form-success">{successMessage}</p> : null}
      <PostForm
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
        repostOfPostId={repostId}
        repostParentTitle={repostParentTitle}
      />
    </section>
  )
}

export default CreatePostPage
