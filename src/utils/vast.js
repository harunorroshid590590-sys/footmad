// Client-side VAST parser. We resolve the tag in the viewer's browser (not the
// server) because ad networks fill based on the real user's IP — a server/
// datacenter request gets no ad. The tag sends CORS headers, so this is allowed.

const parseXml = (text) => new DOMParser().parseFromString(text, 'application/xml')
const textOf = (el) => (el?.textContent || '').trim()

const parseDuration = (str = '') => {
  const m = String(str).match(/(\d{1,2}):(\d{2}):(\d{2})/)
  if (!m) return 0
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

// Prefer a progressive mp4 MediaFile, else the first one.
const pickMediaFile = (doc) => {
  const files = [...doc.querySelectorAll('MediaFile')]
  if (!files.length) return ''
  const mp4 = files.find(
    (f) => /mp4/i.test(f.getAttribute('type') || '') || /\.mp4(\?|$)/i.test(textOf(f))
  )
  return textOf(mp4 || files[0])
}

// Fetch a VAST tag and resolve wrappers (up to `depth` redirects),
// accumulating tracking pixels. Returns null if no playable ad.
export const fetchVastAd = async (url, depth = 3) => {
  const impressions = []
  const clickTracking = []

  let current = url
  for (let i = 0; i <= depth; i++) {
    if (!current) break
    let res
    try {
      res = await fetch(current, { credentials: 'omit', cache: 'no-store' })
    } catch {
      return null
    }
    if (!res.ok) return null

    const doc = parseXml(await res.text())
    impressions.push(...[...doc.querySelectorAll('Impression')].map(textOf).filter(Boolean))
    clickTracking.push(...[...doc.querySelectorAll('ClickTracking')].map(textOf).filter(Boolean))

    const mediaFile = pickMediaFile(doc)
    if (mediaFile) {
      return {
        mediaFile,
        clickThrough: textOf(doc.querySelector('ClickThrough')),
        duration: parseDuration(textOf(doc.querySelector('Duration'))),
        impressions,
        clickTracking
      }
    }

    // No media yet — follow the wrapper if present.
    const wrapper = textOf(doc.querySelector('VASTAdTagURI'))
    if (!wrapper) break
    current = wrapper
  }

  return null
}
