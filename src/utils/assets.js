// Resolves image URLs that may be absolute (provider/CDN) or relative
// to the backend (e.g. "/uploads/abc.png" from the admin upload endpoint).

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

// Strip a trailing "/api" so we can reach static assets served at the origin root.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const resolveAsset = (url) => {
  if (!url) return ''
  const value = String(url).trim()
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value
  return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`
}
