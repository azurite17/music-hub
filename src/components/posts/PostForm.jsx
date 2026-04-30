import { useEffect, useMemo, useState } from 'react'
import { COMMON_MUSIC_GENRES } from '../../constants/musicGenres'
import { DEFAULT_POST_FLAG, POST_FLAG_OPTIONS } from '../../constants/postFlags'
import { uploadPostImage } from '../../services/postImages'
import { normalizePostGenres } from '../../utils/genres'

const initialFormState = {
  title: '',
  content: '',
  imageUrl: '',
  flag: DEFAULT_POST_FLAG,
  genres: [],
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
  const mergedInitial = {
    ...initialFormState,
    ...initialValues,
    flag: initialValues.flag || DEFAULT_POST_FLAG,
    genres: Array.isArray(initialValues.genres) ? initialValues.genres : [],
  }

  const [formData, setFormData] = useState(mergedInitial)
  const [genreDraft, setGenreDraft] = useState('')
  const [presetPick, setPresetPick] = useState('')
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [isWorking, setIsWorking] = useState(false)

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) return null
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  useEffect(() => {
    if (!imagePreviewUrl) return
    return () => URL.revokeObjectURL(imagePreviewUrl)
  }, [imagePreviewUrl])

  function handleChange(event) {
    const { name, value } = event.target
    if (name === 'imageUrl') {
      setImageFile(null)
      setFileInputKey((k) => k + 1)
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleImageFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setImageFile(file)
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  function clearUploadedImage() {
    setImageFile(null)
    setFileInputKey((k) => k + 1)
  }

  function addGenreTag(raw) {
    const tag = typeof raw === 'string' ? raw.trim().slice(0, 40) : ''
    if (!tag) return false

    const current = formData.genres || []
    if (current.some((g) => g.toLowerCase() === tag.toLowerCase())) {
      setError('')
      return false
    }
    if (current.length >= 5) {
      setError('You can add at most 5 genres.')
      return false
    }
    setFormData((prev) => ({ ...prev, genres: [...(prev.genres || []), tag] }))
    setError('')
    return true
  }

  function removeGenreAt(index) {
    setFormData((prev) => ({
      ...prev,
      genres: (prev.genres || []).filter((_, i) => i !== index),
    }))
  }

  function handleAddCustomGenre() {
    if (!genreDraft.trim()) return
    addGenreTag(genreDraft)
    setGenreDraft('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = formData.title.trim()

    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }

    setError('')
    setIsWorking(true)

    try {
      let imageUrl = formData.imageUrl.trim()
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile)
      }
      const genres = normalizePostGenres(formData.genres)
      await onSubmit({
        ...formData,
        imageUrl,
        genres,
        repostOfPostId: repostOfPostId || undefined,
      })
      if (clearOnSuccess) {
        setFormData({ ...initialFormState, flag: DEFAULT_POST_FLAG, genres: [] })
        setImageFile(null)
        setFileInputKey((k) => k + 1)
        setGenreDraft('')
        setPresetPick('')
      }
    } catch (submitError) {
      setError(submitError.message ?? 'Failed to create post.')
    } finally {
      setIsWorking(false)
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

      <fieldset className="genre-fieldset">
        <legend>Music genres (optional, up to 5)</legend>
        <p className="field-hint genre-fieldset-hint">
          Pick from the common list or type your own (press Add or Enter).
        </p>
        <div className="genre-add-row">
          <label className="form-field genre-preset-field">
            <span>Common genres</span>
            <select
              value={presetPick}
              onChange={(e) => {
                const v = e.target.value
                if (v) {
                  addGenreTag(v)
                  setPresetPick('')
                }
              }}
            >
              <option value="">Add from list…</option>
              {COMMON_MUSIC_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field genre-custom-field">
            <span>Custom genre</span>
            <div className="genre-custom-input-row">
              <input
                value={genreDraft}
                onChange={(e) => setGenreDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomGenre()
                  }
                }}
                placeholder="e.g. shoegaze, drill"
                maxLength={40}
              />
              <button type="button" className="button-link secondary" onClick={handleAddCustomGenre}>
                Add
              </button>
            </div>
          </label>
        </div>
        {(formData.genres || []).length > 0 ? (
          <ul className="post-form-genre-chips" aria-label="Selected genres">
            {(formData.genres || []).map((g, index) => (
              <li key={`${g}-${index}`}>
                <span>{g}</span>
                <button type="button" className="genre-chip-remove" onClick={() => removeGenreAt(index)}>
                  <span className="sr-only">Remove {g}</span>
                  <span aria-hidden>×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="status-text genre-empty">No genres added yet.</p>
        )}
      </fieldset>

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

      <div className="form-field post-image-field">
        <span>Image (optional)</span>
        <label className="image-file-label">
          <span className="image-file-label-text">Upload from device</span>
          <input
            key={fileInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
            onChange={handleImageFileChange}
            className="image-file-input"
          />
        </label>
        <small className="field-hint">JPEG, PNG, WebP, or GIF — up to 5 MB.</small>
        {imageFile ? (
          <div className="image-preview-row">
            <button type="button" className="button-link secondary" onClick={clearUploadedImage}>
              Remove file
            </button>
          </div>
        ) : null}
        {(imagePreviewUrl || formData.imageUrl.trim()) && (
          <div className="post-form-image-preview-wrap">
            <img
              className="post-form-image-preview"
              src={imagePreviewUrl || formData.imageUrl.trim()}
              alt=""
            />
          </div>
        )}
        <div className="image-url-nested">
          <span className="image-url-nested-label">Or paste image URL</span>
          <input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            type="url"
            disabled={Boolean(imageFile)}
          />
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button-link" type="submit" disabled={isSubmitting || isWorking}>
        {isSubmitting || isWorking ? submittingLabel : submitLabel}
      </button>
    </form>
  )
}

export default PostForm
