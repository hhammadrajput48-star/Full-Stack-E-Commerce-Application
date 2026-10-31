import React, { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isSignup = searchParams.get('mode') === 'signup'
  const { currentUser, authLoading, login, signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (authLoading) return <div className="app-loading">Loading…</div>
  if (currentUser) return <Navigate to="/dashboard" replace />

  const switchMode = (signupMode) => {
    setError('')
    setSuccess('')
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
    setSearchParams(signupMode ? { mode: 'signup' } : {})
  }

  const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (isSignup) {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError('Please fill in your name, email and password.')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      setSubmitting(true)
      const result = await signup(form)
      setSubmitting(false)
      if (!result.ok) {
        setError(result.message)
        return
      }

      setSuccess(result.message)
      setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
      setSearchParams({})
      return
    }

    setSubmitting(true)
    const result = await login(form.email, form.password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-card__logo">SHOP.CO</Link>
        <div className="auth-tabs" role="tablist">
          <button type="button" className={!isSignup ? 'is-active' : ''} onClick={() => switchMode(false)}>Login</button>
          <button type="button" className={isSignup ? 'is-active' : ''} onClick={() => switchMode(true)}>Sign Up</button>
        </div>

        <div className="auth-card__heading">
          <p>WELCOME {isSignup ? 'TO SHOP.CO' : 'BACK'}</p>
          <h1>{isSignup ? 'Create your account' : 'Login to your account'}</h1>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {success && <div className="auth-success" role="status">{success}</div>}

        <form className="auth-form" onSubmit={submit}>
          {isSignup && (
            <label>
              Full name
              <input name="name" value={form.name} onChange={update} placeholder="Enter your full name" autoComplete="name" />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" />
          </label>
          {isSignup && (
            <label>
              Phone number
              <input name="phone" type="tel" value={form.phone} onChange={update} placeholder="+92 300 1234567" autoComplete="tel" />
            </label>
          )}
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={update} placeholder="Enter your password" autoComplete={isSignup ? 'new-password' : 'current-password'} />
          </label>
          {isSignup && (
            <label>
              Confirm password
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Repeat your password" autoComplete="new-password" />
            </label>
          )}
          <button type="submit" className="btn btn--primary auth-submit" disabled={submitting}>{isSignup ? 'Create Account' : 'Login'}</button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => switchMode(!isSignup)}>{isSignup ? 'Login' : 'Sign Up'}</button>
        </p>
      </div>
    </section>
  )
}
