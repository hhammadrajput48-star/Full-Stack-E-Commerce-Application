import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { currentUser, updateProfile, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
  })

  const update = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    setError('')
    setSaving(true)
    try {
      await updateProfile(form)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const initials = currentUser.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const joined = new Date(currentUser.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <section className="account-page section">
      <div className="account-header">
        <div>
          <p className="account-eyebrow">MY PROFILE</p>
          <h1>Account Details</h1>
        </div>
        {!editing && <button type="button" className="btn btn--outline" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>

      {saved && <div className="profile-success">Profile updated successfully.</div>}
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="profile-avatar">{initials}</div>
          <h2>{currentUser.name}</h2>
          <p>{currentUser.email}</p>
          <span>Member since {joined}</span>
        </aside>

        <div className="profile-details">
          {editing ? (
            <form className="profile-form" onSubmit={submit}>
              <label>Full name<input name="name" value={form.name} onChange={update} /></label>
              <label>Email address<input name="email" type="email" value={form.email} onChange={update} /></label>
              <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} /></label>
              <div className="profile-form__actions">
                <button type="submit" className="btn btn--primary" disabled={saving}>Save Changes</button>
                <button type="button" className="btn btn--outline" onClick={() => { setEditing(false); setError('') }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div><span>Full name</span><strong>{currentUser.name}</strong></div>
              <div><span>Email address</span><strong>{currentUser.email}</strong></div>
              <div><span>Phone number</span><strong>{currentUser.phone || 'Not provided'}</strong></div>
              <div><span>Member since</span><strong>{joined}</strong></div>
            </div>
          )}
          <button type="button" className="profile-logout" onClick={logout}>Log out</button>
        </div>
      </div>
    </section>
  )
}
