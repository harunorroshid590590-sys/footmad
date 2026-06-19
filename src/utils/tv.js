// TV remote / D-pad support.
// - Spatial navigation via the WICG polyfill (arrow keys move focus to the
//   nearest element in that direction, with scrollIntoView).
// - Handles Smart-TV-specific keycodes: Samsung Tizen Back (10009),
//   LG webOS Back (461), plus standard Back/Enter/Media keys.
// Enabled only on TV devices (or forced with ?tv=1 for testing on desktop).

const TV_UA = /tizen|web0s|webos|smart-?tv|googletv|android tv|aft\w|hbbtv|netcast|netraco|viera|bravia|crkey|dlnadoc|sonycebrowser|philipstv|hisense|vidaa|roku/i

export const isTvDevice = () => {
  try {
    return TV_UA.test(navigator.userAgent || '')
  } catch {
    return false
  }
}

const BACK_KEYCODES = new Set([8, 27, 10009, 461]) // Backspace, Escape, Tizen, webOS
const BACK_KEYS = new Set(['Escape', 'GoBack', 'BrowserBack', 'XF86Back'])
const MEDIA_KEYCODES = new Set([179, 415, 19, 10252]) // Play/Pause variants
const MEDIA_KEYS = new Set(['MediaPlayPause', 'MediaPlay', 'MediaPause'])

const isTypingTarget = (el) => {
  if (!el) return false
  const tag = (el.tagName || '').toLowerCase()
  return tag === 'input' || tag === 'textarea' || el.isContentEditable
}

let routerRef = null

const closeTopOverlay = () => {
  const overlays = document.querySelectorAll('[data-overlay]')
  if (!overlays.length) return false
  const top = overlays[overlays.length - 1]
  const closeBtn = top.querySelector('[data-close]')
  if (closeBtn) {
    closeBtn.click()
    return true
  }
  return false
}

const handleBack = (e) => {
  // Don't hijack Backspace while typing in a field.
  if (e.keyCode === 8 && isTypingTarget(e.target)) return
  e.preventDefault()
  if (closeTopOverlay()) return
  if (window.history.length > 1 && routerRef) routerRef.back()
}

const handleOk = (e) => {
  const el = document.activeElement
  if (!el) return
  const tag = (el.tagName || '').toLowerCase()
  // Native elements already activate on Enter; only custom focusables need a click.
  if (['a', 'button', 'input', 'select', 'textarea'].includes(tag)) return
  if (el.getAttribute && el.getAttribute('tabindex') !== null) {
    e.preventDefault()
    el.click()
  }
}

const handleMedia = (e) => {
  const video = document.querySelector('video')
  if (!video) return
  e.preventDefault()
  if (video.paused) video.play().catch(() => {})
  else video.pause()
}

const onKeydown = (e) => {
  if (BACK_KEYCODES.has(e.keyCode) || BACK_KEYS.has(e.key)) return handleBack(e)
  if (e.keyCode === 13 || e.key === 'Enter') return handleOk(e)
  if (MEDIA_KEYCODES.has(e.keyCode) || MEDIA_KEYS.has(e.key)) return handleMedia(e)
}

// Focus the first sensible element on the page (gives the remote a start point).
export const focusFirst = () => {
  const preferred = document.querySelector('[data-focus-default]')
  const target =
    preferred ||
    document.querySelector(
      'main a[href], main button:not([disabled]), main [tabindex="0"], nav a[href]'
    )
  if (target && typeof target.focus === 'function') {
    target.focus()
    target.scrollIntoView?.({ block: 'center', inline: 'center' })
  }
}

export const initTvRemote = async (router) => {
  routerRef = router

  const params = new URLSearchParams(window.location.search)
  if (params.get('tv') === '1') localStorage.setItem('tvMode', '1')
  if (params.get('tv') === '0') localStorage.removeItem('tvMode')

  const enabled =
    localStorage.getItem('tvMode') === '1' || isTvDevice()
  if (!enabled) return

  document.documentElement.classList.add('tv')

  // Load the spatial-navigation polyfill (arrow-key focus movement).
  try {
    await import('spatial-navigation-polyfill')
  } catch (err) {
    console.warn('Spatial navigation polyfill failed to load:', err?.message)
  }

  window.addEventListener('keydown', onKeydown, true)

  // Set initial focus on first paint and after every navigation.
  router.afterEach(() => {
    window.setTimeout(focusFirst, 120)
  })
  window.setTimeout(focusFirst, 400)
}
