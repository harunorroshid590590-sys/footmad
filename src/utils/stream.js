// Shared stream/server normalization so matches and channels feed the
// VideoPlayer with the same shape. Mirrors the logic in Watch.vue.

export const detectStreamType = (url = '', type = '') => {
  const u = String(url).toLowerCase()
  const t = String(type).toLowerCase()
  if (u.includes('.m3u8')) return 'hls'
  if (u.includes('.mpd')) return 'dash'
  if (u.includes('.ts')) return 'ts'
  if (['hls', 'dash', 'ts', 'direct', 'embed'].includes(t)) return t
  if (t === '1') return 'dash'
  if (t === '0') return 'hls'
  if (t === '2') return 'ts'
  return 'direct'
}

const isValidHexString = (value = '') => {
  const v = String(value || '').replace(/\s+/g, '').trim()
  return v.length > 0 && v.length % 2 === 0 && /^[0-9a-f]+$/i.test(v)
}

export const buildDrmFromKey = (drmKey = '', existingDrm = null) => {
  if (existingDrm?.type === 'clearkey' && existingDrm.clearKeys) {
    const entries = Object.entries(existingDrm.clearKeys)
    const hasInvalid = entries.some(([id, k]) => !isValidHexString(id) || !isValidHexString(k))
    if (!hasInvalid && entries.length > 0) return existingDrm
  }
  if (existingDrm?.type === 'widevine' && existingDrm.licenseUrl) return existingDrm

  const value = String(drmKey || '').replace(/\s+/g, '').trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return { type: 'widevine', licenseUrl: value }

  const parts = value.split(':')
  if (parts.length === 2 && isValidHexString(parts[0]) && isValidHexString(parts[1])) {
    return { type: 'clearkey', clearKeys: { [parts[0].trim()]: parts[1].trim() } }
  }
  return null
}

export const normalizeServer = (server = {}, index = 0) => {
  const url = server.url || server.streamUrl || server.externalUrl || server.link || server.src || ''
  const drm = buildDrmFromKey(server.drmKey, server.drm)
  return {
    ...server,
    id: server.id || `${index}`,
    title: server.title || server.name || `Server ${index + 1}`,
    name: server.name || server.title || `Server ${index + 1}`,
    url,
    streamUrl: url,
    externalUrl: server.externalUrl || url,
    type: detectStreamType(url, server.type || server.providerType),
    quality: server.quality || 'HD',
    drm,
    drmError: drm ? server.drmError : null,
    headers: server.headers || {},
    referer: server.referer || server.headers?.Referer || '',
    origin: server.origin || server.headers?.Origin || '',
    userAgent: server.userAgent || server.headers?.['User-Agent'] || '',
    useProxy: server.useProxy !== false,
  }
}

export const normalizeServers = (servers = []) =>
  (Array.isArray(servers) ? servers : [])
    .map((s, i) => normalizeServer(s, i))
    .filter((s) => Boolean(s.url))
