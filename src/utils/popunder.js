// Popunder driver with TWO modes, chosen automatically from the Popunder Code:
//
// 1. SCRIPT mode (default) — the code is an ad-network <script> tag. We inject /
//    re-arm it on a click cadence so it shows repeatedly. NOTE: the network's own
//    frequency cap still applies (often ~3 per session) and CANNOT be removed from
//    code — that cap lives in the network's popunder zone settings.
//
// 2. DIRECT-LINK mode — the code is a plain URL (e.g. a network "direct link" /
//    smartlink). We open it ourselves on the click cadence. This is fully under
//    our control, so it is NOT subject to the script's 3-per-session cap — use
//    this when the client wants "every click".
//
// GAP_CLICKS controls cadence: 0 = every click, 1 = ad → gap → ad, etc.

const GAP_CLICKS = 0 // every click

let started = false
let clickCount = 0

// A plain http(s) URL with no <script> tag → treat as a direct link.
const isDirectLink = (s) => {
  const v = (s || '').trim()
  return /^https?:\/\/\S+$/i.test(v) && !/<\s*script/i.test(v)
}

// (Re)inject the network popunder script so it arms for the next click.
const armScript = (code) => {
  if (!code || !document.body) return
  document.querySelectorAll('script[data-fm-popunder]').forEach(s => s.remove())
  const holder = document.createElement('div')
  holder.innerHTML = code
  const scripts = holder.querySelectorAll('script')
  if (!scripts.length) return
  scripts.forEach((old) => {
    const s = document.createElement('script')
    for (const attr of old.attributes) s.setAttribute(attr.name, attr.value)
    if (old.textContent) s.textContent = old.textContent
    s.async = true
    s.setAttribute('data-fm-popunder', '1')
    document.body.appendChild(s)
  })
}

// Open the direct link as a pop-under (open new tab, keep the current one focused).
const openDirect = (url) => {
  try {
    const w = window.open(url, '_blank')
    if (w) { w.blur(); window.focus() }
  } catch { /* popup blocked */ }
}

export const initPopunder = (config) => {
  if (started) return
  if (typeof window === 'undefined' || !document.body) return
  if (config?.adSettings?.enabled === false) return

  const isMobile = window.innerWidth < 768
  const pop = config?.popunderAds?.[isMobile ? 'mobile' : 'desktop']
  const code = (pop?.code || '').trim()
  if (!pop?.enabled || !code) return

  started = true

  if (isDirectLink(code)) {
    // Direct-link mode: open the URL on the click cadence (no network cap).
    document.addEventListener('click', () => {
      clickCount++
      if (clickCount % (GAP_CLICKS + 1) === 0) openDirect(code)
    }, true)
    return
  }

  // Script mode: arm now, then re-arm on the click cadence.
  armScript(code)
  document.addEventListener('click', () => {
    clickCount++
    if (clickCount % (GAP_CLICKS + 1) === 0) armScript(code)
  }, true)
}
