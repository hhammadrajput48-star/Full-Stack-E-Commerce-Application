// One small wrapper around fetch() that every part of the app uses to talk to the backend.
//
//  - Local dev:  VITE_API_URL is empty, so calls go to "/api/..." and the Vite dev
//                server proxies them to http://localhost:5000 (see vite.config.js).
//  - Production: set VITE_API_URL to your deployed backend, e.g. https://shop-co-api.onrender.com

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const TOKEN_KEY = 'shopco:token'

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* storage unavailable - user will simply have to log in again next visit */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Fired when the server rejects our saved token (expired / tampered). AuthContext listens and logs out.
export const UNAUTHORIZED_EVENT = 'shopco:unauthorized'

export async function api(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Cannot reach the server. Please check your connection and try again.', 0)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    throw new ApiError(data?.message || `Request failed (${response.status}).`, response.status)
  }

  return data
}
