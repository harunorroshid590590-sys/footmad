// Popunder injector with a click-based cadence: show an ad, leave a GAP of N
// clicks, then show another ("ad → gap → ad → gap ..."). Popunder network
// scripts arm once per (re)load and fire on the next user click, so we re-inject
// (re-arm) the script on the right click to get a repeating cadence.
//
// IMPORTANT: the ad NETWORK's own frequency cap on the popunder zone still
// applies. For this cadence to actually take effect, set that zone's frequency
// cap to unlimited in the network dashboard — otherwise the network throttles it
// regardless of what this code does.

const GAP_CLICKS = 1 // ad on a click, then 1 gap click, then ad again (set 0 = every click)

let started = false
let clickCount = 0
let popCode = ''

// (Re)inject the popunder script so it arms for the next click. Old injected
// scripts are removed first to avoid piling up in the DOM.
const arm = () => {
  if (!popCode || !document.body) return
  document.querySelectorAll('script[data-fm-popunder]').forEach(s => s.remove())
  const holder = document.createElement('div')
  holder.innerHTML = popCode
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

export const initPopunder = (config) => {
  if (started) return
  if (typeof window === 'undefined' || !document.body) return
  if (config?.adSettings?.enabled === false) return

  const isMobile = window.innerWidth < 768
  const pop = config?.popunderAds?.[isMobile ? 'mobile' : 'desktop']
  if (!pop?.enabled || !(pop.code || '').trim()) return

  popCode = pop.code
  started = true
  arm() // arm for the first click

  // Re-arm after each "ad + gap" cycle so the next eligible click fires again.
  document.addEventListener('click', () => {
    clickCount++
    if (clickCount % (GAP_CLICKS + 1) === 0) arm()
  }, true)
}
