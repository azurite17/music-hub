import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fromPath = location.state?.from ?? '/'

  async function handleEmailAuth(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setMessage('Account created. Check your email for confirmation if required.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        navigate(fromPath, { replace: true })
      }
    } catch (authError) {
      setError(authError.message ?? 'Authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setMessage('')
    const redirectTo = `${window.location.origin}/`
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (oauthError) setError(oauthError.message ?? 'Google login failed.')
  }

  async function handlePasswordResetRequest() {
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Enter your email first, then click password reset.')
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message ?? 'Could not send reset email.')
      return
    }
    setMessage('Password reset email sent. Check your inbox.')
  }

  return (
    <section className="page-section">
      <h2>Login / Signup</h2>
      <p>Sign in to create, edit, and manage your posts.</p>

      <div className="button-row">
        <button
          type="button"
          className={`button-link ${mode === 'login' ? '' : 'secondary'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`button-link ${mode === 'signup' ? '' : 'secondary'}`}
          onClick={() => setMode('signup')}
        >
          Signup
        </button>
      </div>

      <form className="post-form" onSubmit={handleEmailAuth}>
        <label className="form-field">
          <span>Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={6}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}

        <div className="button-row">
          <button className="button-link" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Submitting...'
              : mode === 'signup'
                ? 'Create account'
                : 'Login'}
          </button>
          <button
            type="button"
            className="button-link secondary"
            onClick={handlePasswordResetRequest}
          >
            Send password reset
          </button>
        </div>
      </form>

      <div className="oauth-block">
        <p className="status-text">Or continue with Google</p>
        <button className="button-link secondary" type="button" onClick={handleGoogleLogin}>
          Continue with Google
        </button>
      </div>
    </section>
  )
}

export default AuthPage
