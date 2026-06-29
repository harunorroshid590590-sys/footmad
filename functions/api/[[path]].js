// Cloudflare Pages Function: same-origin /api proxy → real backend.
// The browser calls /api/* on the Pages domain (e.g. 590.live/api/...), which we
// forward to the backend server-side. Server-to-server fetch has no CORS, so the
// Cloudflare-hosted frontend no longer needs the backend to allow its origin.
//
// Only /api JSON goes through here. Stream proxy (/proxy) and images keep hitting
// the backend directly (the backend already allows them cross-origin).

const BACKEND = 'https://footmad.online'

export async function onRequest(context) {
  const { request, params } = context
  const incoming = new URL(request.url)
  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path || '')
  const target = `${BACKEND}/api/${path}${incoming.search}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const init = {
    method: request.method,
    headers,
    redirect: 'follow'
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer()
  }

  const resp = await fetch(target, init)
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: resp.headers
  })
}
