<template>
  <div class="absolute inset-0 z-30 bg-black select-none">
    <!-- Loading image shown while the ad is being fetched -->
    <template v-if="!ad">
      <img src="/img/Welcome%20to.png" alt="Loading" class="w-full h-full object-cover" />
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
    </template>

    <!-- Ad -->
    <template v-else>
    <!-- Ad video -->
    <video
      ref="adVideo"
      :src="ad.mediaFile"
      class="w-full h-full object-contain bg-black"
      :class="ad.clickThrough ? 'cursor-pointer' : ''"
      autoplay
      playsinline
      @playing="onPlaying"
      @ended="finish"
      @error="finish"
      @timeupdate="onTime"
      @click="onVideoClick"
    />

    <!-- Top bar: Ad badge + mute -->
    <div class="absolute top-3 left-3 flex items-center gap-2">
      <span class="bg-amber-400 text-black text-[11px] font-bold tracking-wide px-1.5 py-0.5 rounded-sm">Ad</span>
      <span class="bg-black/60 text-white/90 text-xs px-2 py-0.5 rounded">
        {{ remaining > 0 ? formatTime(remaining) : '' }}
      </span>
    </div>

    <button
      @click.stop="toggleMute"
      class="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
      :aria-label="muted ? 'Unmute' : 'Mute'"
    >
      <svg v-if="muted" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.59 3L19 14.41 17.59 15.83 15.17 13.41 12.76 15.83 11.34 14.41 13.76 12 11.34 9.59 12.76 8.17 15.17 10.59 17.59 8.17 19 9.59 16.59 12z"/></svg>
      <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.23v2.06a7 7 0 010 13.42v2.06a9 9 0 000-17.54z"/></svg>
    </button>

    <!-- Bottom controls -->
    <div class="absolute inset-x-0 bottom-0">
      <div class="flex items-end justify-between gap-3 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <!-- Click-through CTA -->
        <a
          v-if="ad.clickThrough"
          :href="ad.clickThrough"
          target="_blank"
          rel="noopener"
          @click.stop="onVideoClick"
          class="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-black text-xs font-semibold px-3 py-1.5 rounded shadow"
        >
          Visit advertiser
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5h5v5M19 5l-9 9M5 7v12h12" /></svg>
        </a>
        <span v-else></span>

        <!-- Skip -->
        <button
          v-if="canSkip"
          @click.stop="finish"
          class="inline-flex items-center gap-1.5 bg-black/70 hover:bg-black border border-white/30 text-white text-sm font-medium pl-4 pr-3 py-2 rounded-full transition-colors"
        >
          Skip Ad
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
        <span
          v-else
          class="bg-black/60 text-white/80 text-xs px-3 py-2 rounded-full border border-white/10"
        >
          Skip in {{ skipIn }}s
        </span>
      </div>

      <!-- Progress bar -->
      <div class="h-1 w-full bg-white/20">
        <div class="h-full bg-amber-400 transition-[width] duration-200" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { fetchVastAd } from '@/utils/vast'

const emit = defineEmits(['complete'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

const ad = ref(null)
const adVideo = ref(null)
const remaining = ref(0)
const skipIn = ref(0)
const canSkip = ref(false)
const muted = ref(false)
const progress = ref(0)
const impressionsFired = ref(false)
let done = false
let startTimer = null

const formatTime = (s) => {
  const sec = Math.max(0, Math.floor(s))
  const m = Math.floor(sec / 60)
  const r = sec % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

// Fire tracking pixels without needing CORS.
const firePixels = (urls = []) => {
  urls.forEach((u) => {
    try { new Image().src = u } catch { /* ignore */ }
  })
}

const finish = () => {
  if (done) return
  done = true
  emit('complete')
}

const onPlaying = () => {
  if (!impressionsFired.value) {
    impressionsFired.value = true
    firePixels(ad.value?.impressions)
  }
}

const onTime = () => {
  const v = adVideo.value
  if (!v || !v.duration || !isFinite(v.duration)) return
  remaining.value = Math.max(0, Math.ceil(v.duration - v.currentTime))
  progress.value = Math.min(100, (v.currentTime / v.duration) * 100)
  const skipAfter = ad.value?.skipAfter ?? 5
  if (skipAfter <= 0) { canSkip.value = true; skipIn.value = 0; return }
  skipIn.value = Math.max(0, Math.ceil(skipAfter - v.currentTime))
  if (v.currentTime >= skipAfter) canSkip.value = true
}

const onVideoClick = () => {
  if (!ad.value?.clickThrough) return
  firePixels(ad.value.clickTracking)
  window.open(ad.value.clickThrough, '_blank', 'noopener')
}

const toggleMute = () => {
  const v = adVideo.value
  if (!v) return
  v.muted = !v.muted
  muted.value = v.muted
  if (!v.muted) v.play().catch(() => {})
}

const tryPlay = async () => {
  const v = adVideo.value
  if (!v) return
  try {
    await v.play()
  } catch {
    // Autoplay with sound blocked — fall back to muted autoplay.
    v.muted = true
    muted.value = true
    try { await v.play() } catch { finish() }
  }
}

onMounted(async () => {
  try {
    // Read the configured VAST tag, then resolve it in the browser so the ad
    // network fills based on the real viewer (server-side fetch gets no ad).
    const { data } = await axios.get(`${API_URL}/ad-config`)
    const va = data?.videoAd
    if (!va?.enabled || !va.vastUrl) { finish(); return }

    const resolved = await fetchVastAd(va.vastUrl)
    if (!resolved?.mediaFile) { finish(); return }

    ad.value = { ...resolved, skipAfter: va.skipAfter ?? 5 }
    requestAnimationFrame(tryPlay)
    // Safety: if the ad never starts, don't block the stream.
    startTimer = window.setTimeout(() => {
      if (!impressionsFired.value) finish()
    }, 8000)
  } catch {
    finish()
  }
})

onBeforeUnmount(() => {
  if (startTimer) window.clearTimeout(startTimer)
})
</script>
