<template>
  <iframe
    ref="frame"
    :style="{ width: '100%', height: height + 'px', border: '0', display: 'block', overflow: 'hidden' }"
    scrolling="no"
    frameborder="0"
    referrerpolicy="no-referrer-when-downgrade"
    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
  ></iframe>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/**
 * Renders arbitrary ad HTML/JS inside a "friendly iframe". This is the reliable
 * way to run network ad codes (Adsterra atOptions + invoke.js, document.write,
 * etc.) — v-html / innerHTML silently DROP <script> tags, which is why the
 * banners never rendered. The iframe also auto-reports its content height.
 */
const props = defineProps({
  code: { type: String, default: '' }
})

const frame = ref(null)
const height = ref(0)

const onMessage = (e) => {
  if (frame.value && e.source === frame.value.contentWindow && e.data && e.data.__adHeight != null) {
    height.value = Math.max(0, Number(e.data.__adHeight) || 0)
  }
}

const render = () => {
  const el = frame.value
  if (!el || !props.code) return
  const doc = el.contentDocument || el.contentWindow?.document
  if (!doc) return

  const html =
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}' +
    // Center the ad inside the slot so it sits neatly in the banner strip
    // (no left-aligned black gap on desktop / lopsided cut on mobile).
    'body{display:flex;justify-content:center;align-items:center;min-height:1px}' +
    'img{max-width:100%;height:auto}</style></head><body>' +
    props.code +
    '<script>(function(){function h(){try{parent.postMessage({__adHeight:document.body.scrollHeight},"*")}catch(e){}}' +
    'window.addEventListener("load",h);setInterval(h,1000);setTimeout(h,300);})();<\/script>' +
    '</body></html>'

  doc.open()
  doc.write(html)
  doc.close()
}

onMounted(() => {
  window.addEventListener('message', onMessage)
  render()
})

onBeforeUnmount(() => window.removeEventListener('message', onMessage))

// Re-render if the ad code changes (e.g. config loads after mount).
watch(() => props.code, render)
</script>
