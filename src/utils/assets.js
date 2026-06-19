// Resolves image URLs that may be absolute (provider/CDN) or relative
// to the backend (e.g. "/uploads/abc.png" from the admin upload endpoint).

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

// Strip a trailing "/api" so we can reach static assets served at the origin root.
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const resolveAsset = (url) => {
  if (!url) return ''
  const value = String(url).trim()
  if (value.startsWith('data:')) return value
  // Protocol-relative → https
  if (value.startsWith('//')) return `https:${value}`
  // Upgrade http → https to avoid mixed-content blocking on an https site.
  if (/^http:\/\//i.test(value)) return value.replace(/^http:\/\//i, 'https://')
  if (/^https:\/\//i.test(value)) return value
  // Relative path served by the backend (e.g. /uploads/..)
  return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`
}
