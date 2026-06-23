// Shared popunder injector. Loads the configured popunder script as REAL
// <script> elements (v-html / innerHTML never execute injected scripts), and
// guards so it runs only once per browser session across every page — the
// module flag covers SPA navigation, sessionStorage covers full reloads.

let injectedThisLoad = false

export const injectPopunderOnce = (config) => {
  if (injectedThisLoad) return
  if (typeof window === 'undefined' || !document.body) return

  // Respect the global "Enable Ads" switch and the per-session cap (0 = off).
  const settings = config?.adSettings || {}
  if (settings.enabled === false) return
  if (Number(settings.maxPopupPerSession) === 0) return

  try {
    if (sessionStorage.getItem('fm_popunder_done') === '1') {
      injectedThisLoad = true
      return
    }
  } catch {
    /* sessionStorage blocked — fall back to the module flag only */
  }

  const isMobile = window.innerWidth < 768
  const pop = config?.popunderAds?.[isMobile ? 'mobile' : 'desktop']
  if (!pop?.enabled || !(pop.code || '').trim()) return

  const holder = document.createElement('div')
  holder.innerHTML = pop.code
  const scripts = holder.querySelectorAll('script')
  if (!scripts.length) return

  scripts.forEach((old) => {
    const s = document.createElement('script')
    for (const attr of old.attributes) s.setAttribute(attr.name, attr.value)
    if (old.textContent) s.textContent = old.textContent
    s.async = true
    document.body.appendChild(s)
  })

  injectedThisLoad = true
  try { sessionStorage.setItem('fm_popunder_done', '1') } catch { /* ignore */ }
}
