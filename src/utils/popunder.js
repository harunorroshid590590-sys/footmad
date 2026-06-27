// Drives BOTH ad types together on a click cadence:
//
// 1. Popunder Ads — the Popunder Code. A <script> is injected/re-armed (the
//    network self-fires it on clicks; its own frequency cap, often ~3/session,
//    still applies and cannot be removed from code). A plain URL is opened by us.
//
// 2. Direct Link Ads — the Direct Link "Redirect URL". We open it on every click.
//    Fully under our control, so NOT subject to any network frequency cap.
//
// Both run at the same time when both are enabled.
// GAP_CLICKS: 0 = every click, 1 = ad → gap → ad, etc.

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

// Open a URL as a pop-under (new tab, keep the current tab focused).
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

  // Direct Link Ads — redirect URL opened on every click (no network cap).
  const dl = config?.directLinkAds
  const directUrl = (dl?.enabled && isDirectLink(dl.redirectUrl)) ? dl.redirectUrl.trim() : ''

  // Popunder Ads — script (re-armed) or plain URL (opened).
  const isMobile = window.innerWidth < 768
  const pop = config?.popunderAds?.[isMobile ? 'mobile' : 'desktop']
  const popCode = (pop?.enabled && (pop.code || '').trim()) ? pop.code.trim() : ''
  const popIsUrl = popCode && isDirectLink(popCode)

  if (!directUrl && !popCode) return
  started = true

  // Arm the popunder script up front so the network can fire it on the first click.
  if (popCode && !popIsUrl) armScript(popCode)

  document.addEventListener('click', () => {
    clickCount++
    if (clickCount % (GAP_CLICKS + 1) !== 0) return
    // Direct link: open every (cadence) click.
    if (directUrl) openDirect(directUrl)
    // Popunder: a URL is opened by us; a script is re-armed (it self-fires).
    if (popCode) {
      if (popIsUrl) openDirect(popCode)
      else armScript(popCode)
    }
  }, true)
}
