import { useState } from 'react'
import { DEFAULT_POST_FLAG, POST_FLAG_OPTIONS } from '../../constants/postFlags'

const initialFormState = {
  title: '',
  content: '',
  imageUrl: '',
  flag: DEFAULT_POST_FLAG,
}

function PostForm({
  onSubmit,
  isSubmitting,
  initialValues = initialFormState,
  submitLabel = 'Publish post',
  submittingLabel = 'Publishing...',
  repostOfPostId = null,
  repostParentTitle = '',
  clearOnSuccess = true,
}) {
  const [formData, setFormData] = useState({
    ...initialFormState,
    ...initialValues,
    flag: initialValues.flag || DEFAULT_POST_FLAG,
  })
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = formData.title.trim()

    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }

    setError('')

    try {
      await onSubmit({
        ...formData,
        repostOfPostId: repostOfPostId || undefined,
      })
      if (clearOnSuccess) {
        setFormData({ ...initialFormState, flag: DEFAULT_POST_FLAG })
      }
    } catch (submitError) {
      setError(submitError.message ?? 'Failed to create post.')
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {repostOfPostId ? (
        <div className="repost-banner">
          <p>
            <strong>Repost thread:</strong> referencing{' '}
            {repostParentTitle ? `“${repostParentTitle}”` : 'another post'} (
            <code className="repost-id">{repostOfPostId}</code>)
          </p>
        </div>
      ) : null}

      <label className="form-field">
        <span>Title *</span>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What do you want to discuss?"
          maxLength={120}
          required
        />
      </label>

      <label className="form-field">
        <span>Flag</span>
        <select name="flag" value={formData.flag} onChange={handleChange}>
          {POST_FLAG_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Content (optional)</span>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Add more details, context, or your opinion..."
          rows={6}
        />
      </label>

      <label className="form-field">
        <span>Image URL (optional)</span>
        <input
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          type="url"
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button-link" type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </form>
  )
}

export default PostForm
