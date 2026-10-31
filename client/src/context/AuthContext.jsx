import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, tokenStore, UNAUTHORIZED_EVENT } from '../api/http.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  // True while we check a saved login token with the server on first load.
  const [authLoading, setAuthLoading] = useState(() => Boolean(tokenStore.get()))

  // Restore the session on page load: if a token is saved, ask the server who it belongs to.
  useEffect(() => {
    if (!tokenStore.get()) return undefined
    let cancelled = false

    api('/auth/me')
      .then((data) => {
        if (!cancelled) setCurrentUser(data.user)
      })
      .catch((error) => {
        // Bad/expired token -> forget it. A network error keeps the token so a refresh can retry.
        if (error.status === 401) tokenStore.clear()
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // If any request later gets a 401 (token expired), log the user out.
  useEffect(() => {
    const onUnauthorized = () => {
      tokenStore.clear()
      setCurrentUser(null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const signup = async ({ name, email, phone, password }) => {
    try {
      const data = await api('/auth/signup', { method: 'POST', body: { name, email, phone, password } })
      return { ok: true, user: data.user, message: data.message }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const login = async (email, password) => {
    try {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } })
      tokenStore.set(data.token)
      setCurrentUser(data.user)
      return { ok: true, user: data.user }
    } catch (error) {
      return { ok: false, message: error.message }
    }
  }

  const logout = useCallback(() => {
    tokenStore.clear()
    setCurrentUser(null)
  }, [])

  // Throws on failure (e.g. email already taken) so the Profile page can show the message.
  const updateProfile = async (updates) => {
    const data = await api('/auth/me', { method: 'PATCH', body: updates })
    setCurrentUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
