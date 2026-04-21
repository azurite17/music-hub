import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setMessage('Password updated successfully. You can now login.')
      setTimeout(() => navigate('/auth'), 900)
    } catch (resetError) {
      setError(resetError.message ?? 'Unable to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <h2>Reset Password</h2>
      <p>Open this page from your email reset link, then set a new password.</p>

      <form className="post-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>New password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>

        <label className="form-field">
          <span>Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}

        <button className="button-link" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </section>
  )
}

export default ResetPasswordPage
