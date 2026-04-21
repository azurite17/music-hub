import { useState } from 'react'

const initialFormState = {
  title: '',
  content: '',
  imageUrl: '',
}

function PostForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(initialFormState)
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
      await onSubmit(formData)
      setFormData(initialFormState)
    } catch (submitError) {
      setError(submitError.message ?? 'Failed to create post.')
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
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
        {isSubmitting ? 'Publishing...' : 'Publish post'}
      </button>
    </form>
  )
}

export default PostForm
