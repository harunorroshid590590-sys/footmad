<template>
  <div class="relative w-full bg-black overflow-hidden shadow-2xl">
    <!-- Branded loading screen (shown while the stream buffers) -->
    <div
      v-if="loading"
      class="absolute inset-0 z-20 bg-black"
    >
      <img src="/img/Welcome%20to.png" alt="Loading" class="w-full h-full object-cover" />
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error Message (only after auto-retries are exhausted) -->
    <div
      v-if="showError"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center text-center bg-black/90 backdrop-blur-sm px-5 py-6"
    >
      <div class="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94L1.7 18a1.5 1.5 0 001.3 2.25h18a1.5 1.5 0 001.3-2.25L13.66 3.94a1.5 1.5 0 00-2.6 0z" />
        </svg>
      </div>
      <h3 class="text-white text-base sm:text-lg font-semibold">Stream unavailable</h3>
      <p class="text-text-muted text-xs sm:text-sm max-w-[18rem] mt-1">This stream couldn’t be played. Try another server.</p>
      <button
        @click="manualRetry"
        class="mt-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Video Element -->
    <video
      ref="videoElement"
      class="w-full aspect-video"
      poster="/img/Welcome%20to.png"
      autoplay
      playsinline
      @error="handleError"
    ></video>

    <div
      ref="jwContainer"
      class="hidden w-full aspect-video"
    ></div>

    <!-- Live Badge -->
    <div
      v-if="isLive"
      class="absolute top-4 left-4 z-10"
    >
      <span class="live-badge flex items-center space-x-1">
        <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>LIVE</span>
      </span>
    </div>

    <!-- Custom Controls -->
    <div
      v-if="!loading && !error"
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-10"
      :class="{ 'opacity-0': !controlsVisible, 'opacity-100': controlsVisible }"
      @mouseenter="showControls"
      @mouseleave="hideControls"
    >
      <!-- Progress Bar -->
      <div
        tabindex="0"
        role="slider"
        aria-label="Seek (use left/right arrows)"
        class="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:h-1.5"
        @click="seek"
        @keydown.left.prevent="seekBy(-10)"
        @keydown.right.prevent="seekBy(10)"
      >
        <div
          class="h-full rounded-full relative"
          :class="isLive ? 'bg-accent' : 'bg-primary'"
          :style="{ width: isLive ? '100%' : progress + '%' }"
        >
          <div
            class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            :class="isLive ? 'bg-accent' : 'bg-white'"
          ></div>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Play/Pause -->
          <button
            @click="togglePlay"
            class="text-white hover:text-primary transition-colors"
          >
            <svg v-if="isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <!-- Volume -->
          <div class="flex items-center space-x-2">
            <button
              @click="toggleMute"
              class="text-white hover:text-primary transition-colors"
            >
              <svg v-if="!isMuted" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model="volume"
              @input="setVolume"
              class="w-20 h-1 accent-primary"
            />
          </div>

          <!-- Time (live streams have no finite duration) -->
          <span class="text-white text-sm">
            {{ formatTime(currentTime) }}<template v-if="hasFiniteDuration"> / {{ formatTime(duration) }}</template>
          </span>
        </div>

        <div class="flex items-center space-x-4">
          <!-- Quality -->
          <div class="relative">
            <button
              @click="showQualityMenu = !showQualityMenu"
              class="text-white hover:text-primary transition-colors flex items-center"
              aria-label="Quality"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
            <div
              v-if="showQualityMenu"
              class="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg p-1.5 min-w-[130px] z-20"
            >
              <button
                v-for="quality in qualityOptions"
                :key="quality"
                @click="setQuality(quality)"
                class="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm rounded hover:bg-card-hover transition-colors"
                :class="currentQuality === quality ? 'text-white' : 'text-text-muted'"
              >
                <svg v-if="currentQuality === quality" class="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span v-else class="w-4 h-4 shrink-0"></span>
                {{ quality }}
              </button>
            </div>
          </div>

          <!-- Speed -->
          <div class="relative">
            <button
              @click="showSpeedMenu = !showSpeedMenu"
              class="text-white hover:text-primary transition-colors text-sm font-medium"
            >
              {{ playbackSpeed }}x
            </button>
            <div
              v-if="showSpeedMenu"
              class="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg p-2 space-y-1 z-20"
            >
              <button
                v-for="speed in speeds"
                :key="speed"
                @click="setPlaybackSpeed(speed)"
                class="block w-full text-left px-3 py-1 text-sm rounded hover:bg-card-hover transition-colors"
                :class="{ 'text-primary': playbackSpeed === speed, 'text-text-muted': playbackSpeed !== speed }"
              >
                {{ speed }}x
              </button>
            </div>
          </div>

          <!-- Fullscreen -->
          <button
            @click="toggleFullscreen"
            class="text-white hover:text-primary transition-colors"
          >
            <svg v-if="!isFullscreen" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Hls from 'hls.js'
import shaka from 'shaka-player'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'
const PROXY_BASE_URL = API_URL.replace(/\/api$/, '')

const props = defineProps({
  stream: {
    type: Object,
    required: true
  },
  isLive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['error', 'ready'])

const videoElement = ref(null)
const jwContainer = ref(null)
const loading = ref(true)
const error = ref(null)
const isPlaying = ref(false)

// Auto-retry on stream failure: keep showing the loading image and silently
// reload a few times before surfacing the manual "Stream unavailable" overlay.
const MAX_AUTO_RETRY = 4
const autoRetryCount = ref(0)
let autoRetryTimer = null
const showError = computed(() => !!error.value && autoRetryCount.value >= MAX_AUTO_RETRY)

watch(error, (val) => {
  if (val && autoRetryCount.value < MAX_AUTO_RETRY) {
    autoRetryCount.value++
    loading.value = true // show the branded image while we retry
    clearTimeout(autoRetryTimer)
    autoRetryTimer = setTimeout(() => retry(), 2500)
  }
})
const isMuted = ref(false)
const volume = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const hasFiniteDuration = computed(() => Number.isFinite(duration.value) && duration.value > 0)
const progress = ref(0)
const isFullscreen = ref(false)
const controlsVisible = ref(true)
const showQualityMenu = ref(false)
const showSpeedMenu = ref(false)
const currentQuality = ref('Auto')

// Resolutions high → low, with "Auto" at the bottom (like a standard player menu).
const qualityOptions = computed(() => {
  const res = qualities.value
    .filter((q) => q !== 'Auto')
    .sort((a, b) => parseInt(b) - parseInt(a))
  return [...res, 'Auto']
})
const playbackSpeed = ref(1)
const qualities = ref(['Auto'])
const speeds = ref([0.5, 0.75, 1, 1.25, 1.5, 2])

let hls = null
let shakaPlayer = null
let jwPlayer = null
let controlsTimeout = null
let hlsNetworkRetryCount = 0
let handlingFallback = false

const JW_PLAYER_KEY = 'ypdL3Acgwp4Uh2/LDE9dYh3W/EPwDMuA2yid4ytssfI='
const JW_PLAYER_SCRIPT_URL = 'https://ssl.p.jwpcdn.com/player/v/8.36.4/jwplayer.js'

const isValidHexString = (value = '') => {
  const normalized = String(value || '').replace(/\s+/g, '').trim()
  return normalized.length > 0 && normalized.length % 2 === 0 && /^[0-9a-f]+$/i.test(normalized)
}

const normalizeClearKeys = (clearKeys = {}) => {
  const normalized = {}

  Object.entries(clearKeys || {}).forEach(([keyId, key]) => {
    const cleanKeyId = String(keyId || '').replace(/\s+/g, '').trim()
    const cleanKey = String(key || '').replace(/\s+/g, '').trim()

    if (cleanKeyId && cleanKey) {
      normalized[cleanKeyId] = cleanKey
    }
  })

  return normalized
}

const getStreamUrl = (stream = props.stream) => (
  stream?.url ||
  stream?.streamUrl ||
  stream?.sourceUrl ||
  stream?.link ||
  ''
)

const getStreamHeaders = (stream = props.stream) => {
  const headers = { ...(stream?.headers || {}) }

  if (stream?.referer && !headers.Referer) headers.Referer = stream.referer
  if (stream?.origin && !headers.Origin) headers.Origin = stream.origin
  if (stream?.userAgent && !headers['User-Agent']) headers['User-Agent'] = stream.userAgent

  return headers
}

const hasCustomHeaders = (stream = props.stream) => Object.keys(getStreamHeaders(stream)).length > 0

const detectStreamType = (stream = props.stream) => {
  const explicitType = String(stream?.type || stream?.streamType || '').toLowerCase()
  const url = getStreamUrl(stream).toLowerCase()

  if (url.includes('.m3u8')) return 'hls'
  if (url.includes('.mpd')) return 'dash'
  if (url.includes('.ts')) return 'ts'
  if (['hls', 'dash', 'ts', 'direct'].includes(explicitType)) return explicitType
  if (explicitType === '1') return 'dash'
  if (explicitType === '0') return 'hls'
  if (explicitType === '2') return 'ts'

  return 'direct'
}

const buildProxyUrl = (url, stream = props.stream) => {
  if (!url) return ''
  if (isProxyUrl(url)) return url

  const proxyUrl = new URL(`${PROXY_BASE_URL}/proxy/direct`)
  proxyUrl.searchParams.set('url', url)

  const headers = getStreamHeaders(stream)
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      proxyUrl.searchParams.set(key, value)
    }
  })

  return proxyUrl.toString()
}

const isProxyUrl = (url = '') => {
  try {
    const parsedUrl = new URL(url, window.location.href)
    return parsedUrl.pathname.endsWith('/proxy/direct') && parsedUrl.searchParams.has('url')
  } catch {
    return false
  }
}

const shouldProxyRequest = (stream = props.stream) => {
  const streamType = detectStreamType(stream)
  return Boolean(stream?.useProxy || hasCustomHeaders(stream) || ['hls', 'dash', 'ts'].includes(streamType))
}

const hasDrmConfig = (stream = props.stream) => {
  if (stream?.drm?.type === 'clearkey') {
    return Object.keys(normalizeClearKeys(stream.drm.clearKeys || {})).length > 0
  }

  if (stream?.drm?.type === 'widevine') {
    return Boolean(stream.drm.licenseUrl)
  }

  return false
}

const formatShakaError = (shakaError) => {
  const code = shakaError?.code
  const data = Array.isArray(shakaError?.data) ? shakaError.data : []

  if (code === 1001) {
    const status = data[1]
    const requestUri = data[5] || data[0]

    if (status && requestUri) {
      return `Upstream server returned HTTP ${status} for the stream request.`
    }

    if (status) {
      return `Upstream server returned HTTP ${status} for the stream request.`
    }
  }

  if (code === 1002) {
    return 'The stream request failed before the upstream server returned a valid response.'
  }

  if (code === 1003) {
    return 'The stream request timed out before playback could start.'
  }

  return shakaError?.message || 'Stream error'
}

const normalizePlayerError = (playerError) => {
  if (playerError?.code && Array.isArray(playerError?.data)) {
    return {
      ...playerError,
      message: formatShakaError(playerError)
    }
  }

  return playerError
}

const formatNativeVideoError = () => {
  const mediaError = videoElement.value?.error

  if (!mediaError) {
    return {
      message: 'The browser could not start playback for this stream.',
      code: 'UNKNOWN_MEDIA_ERROR',
      source: 'html5-video'
    }
  }

  const codeMap = {
    1: 'Playback was interrupted before the stream could continue.',
    2: 'A network error interrupted the media download.',
    3: 'The browser could not decode this media stream.',
    4: 'This stream format is not supported by the browser.'
  }

  const message = codeMap[mediaError.code] || 'The browser reported a media playback failure.'

  return {
    message,
    code: mediaError.code,
    source: 'html5-video',
    networkState: videoElement.value?.networkState,
    readyState: videoElement.value?.readyState,
    currentSrc: videoElement.value?.currentSrc || getStreamUrl()
  }
}

const playMedia = async () => {
  try {
    await videoElement.value?.play()
  } catch (playError) {
    videoElement.value.muted = true
    await videoElement.value?.play().catch(() => {})
  }
}

const initializePlayer = async () => {
  loading.value = true
  error.value = null
  qualities.value = ['Auto']
  currentQuality.value = 'Auto'
  hlsNetworkRetryCount = 0
  handlingFallback = false

  const streamUrl = getStreamUrl()
  if (!streamUrl) {
    error.value = 'No stream URL provided'
    loading.value = false
    return
  }

  const streamType = detectStreamType()

  try {
    if (hasDrmConfig()) {
      await initializeShaka(streamUrl)
    } else if (streamType === 'hls') {
      await initializeHLS(streamUrl)
    } else if (streamType === 'ts') {
      await initializeTS(streamUrl)
    } else if (streamType === 'dash') {
      await initializeShaka(streamUrl)
    } else {
      await initializeDirectPlayback(streamUrl)
    }
  } catch (err) {
    if (hasDrmConfig()) {
      try {
        await fallbackToJWPlayer(streamUrl, err)
        return
      } catch (fallbackError) {
        const normalizedFallbackError = normalizePlayerError(fallbackError)
        error.value = normalizedFallbackError?.message || 'Failed to load stream'
        loading.value = false
        emit('error', normalizedFallbackError)
        return
      }
    }

    const normalizedError = normalizePlayerError(err)
    error.value = normalizedError?.message || 'Failed to load stream'
    loading.value = false
    emit('error', normalizedError)
  }
}

const initializeHLS = async (url) => {
  if (Hls.isSupported()) {
    const finalSourceUrl = shouldProxyRequest() ? buildProxyUrl(url) : url
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      xhrSetup: (xhr, requestUrl) => {
        const finalUrl = shouldProxyRequest() ? buildProxyUrl(requestUrl) : requestUrl
        xhr.open('GET', finalUrl, true)

        if (!shouldProxyRequest()) {
          const headers = getStreamHeaders()
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value)
          })
        }
      }
    })

    hls.loadSource(finalSourceUrl)
    hls.attachMedia(videoElement.value)

    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
      loading.value = false
      emit('ready')
      await playMedia()
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) {
        return
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        const responseCode = data.response?.code || data.response?.status
        const isHttpFailure = typeof responseCode === 'number' && responseCode >= 400
        const isFragmentFailure = String(data.details || '').toLowerCase().includes('frag')

        if (!isHttpFailure && !isFragmentFailure && hlsNetworkRetryCount < 1) {
          hlsNetworkRetryCount += 1
          hls.startLoad()
          return
        }
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError()
        return
      }

      error.value = data.details || 'Stream error'
      loading.value = false
      emit('error', data)
    })

    hls.on(Hls.Events.LEVELS_LOADED, (event, data) => {
      const streamQualities = data.levels
        .map(level => level.height ? `${level.height}p` : null)
        .filter(Boolean)

      qualities.value = ['Auto', ...new Set(streamQualities)]
    })

    return
  }

  if (videoElement.value.canPlayType('application/vnd.apple.mpegurl')) {
    const finalUrl = shouldProxyRequest() ? buildProxyUrl(url) : url

    const onLoadedMetadata = async () => {
      videoElement.value.removeEventListener('loadedmetadata', onLoadedMetadata)
      loading.value = false
      emit('ready')
      await playMedia()
    }

    videoElement.value.addEventListener('loadedmetadata', onLoadedMetadata)
    videoElement.value.src = finalUrl
    videoElement.value.load()
    return
  }

  throw new Error('HLS not supported')
}

const initializeTS = async (url) => {
  const finalUrl = shouldProxyRequest() ? buildProxyUrl(url) : url

  if (Hls.isSupported()) {
    const manifest = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-TARGETDURATION:12',
      '#EXT-X-MEDIA-SEQUENCE:0',
      '#EXTINF:12.0,',
      finalUrl,
      '#EXT-X-ENDLIST'
    ].join('\n')
    const manifestUrl = URL.createObjectURL(new Blob([manifest], {
      type: 'application/vnd.apple.mpegurl'
    }))

    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    })

    hls.loadSource(manifestUrl)
    hls.attachMedia(videoElement.value)

    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
      URL.revokeObjectURL(manifestUrl)
      loading.value = false
      emit('ready')
      await playMedia()
    })

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) {
        return
      }

      URL.revokeObjectURL(manifestUrl)

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError()
        return
      }

      error.value = data.details || 'TS stream error'
      loading.value = false
      emit('error', data)
    })

    return
  }

  await initializeDirectPlayback(url)
}

const initializeShaka = async (url) => {
  if (props.stream?.drmError) {
    throw new Error(props.stream.drmError)
  }

  shakaPlayer = new shaka.Player()
  await shakaPlayer.attach(videoElement.value)

  const drmConfig = {}
  if (props.stream?.drm?.type === 'clearkey' && props.stream.drm.clearKeys) {
    const normalizedClearKeys = normalizeClearKeys(props.stream.drm.clearKeys)
    const clearKeyEntries = Object.entries(normalizedClearKeys)
    const hasInvalidEntry = clearKeyEntries.some(([keyId, key]) => !isValidHexString(keyId) || !isValidHexString(key))

    if (hasInvalidEntry || clearKeyEntries.length === 0) {
      throw new Error('Provider returned an invalid ClearKey pair for this stream.')
    }

    drmConfig.clearKeys = normalizedClearKeys
  } else if (props.stream?.drm?.type === 'widevine' && props.stream.drm.licenseUrl) {
    drmConfig.servers = {
      'com.widevine.alpha': props.stream.drm.licenseUrl
    }
  }

  if (Object.keys(drmConfig).length > 0) {
    shakaPlayer.configure({ drm: drmConfig })
  }

  const networkingEngine = shakaPlayer.getNetworkingEngine()
  if (networkingEngine) {
    networkingEngine.registerRequestFilter((type, request) => {
      const isMediaRequest =
        type === shaka.net.NetworkingEngine.RequestType.MANIFEST ||
        type === shaka.net.NetworkingEngine.RequestType.SEGMENT

      if (!isMediaRequest || !request.uris?.length) {
        return
      }

      const originalUrl = request.uris[0]

      if (shouldProxyRequest()) {
        request.uris = [buildProxyUrl(originalUrl)]
        return
      }

      const headers = getStreamHeaders()
      Object.entries(headers).forEach(([key, value]) => {
        request.headers[key] = value
      })
    })
  }

  shakaPlayer.addEventListener('error', (event) => {
    const normalizedError = normalizePlayerError(event.detail || event)
    if (hasDrmConfig() && !handlingFallback) {
      handlingFallback = true
      fallbackToJWPlayer(url, normalizedError).catch((fallbackError) => {
        const normalizedFallbackError = normalizePlayerError(fallbackError)
        error.value = normalizedFallbackError?.message || 'Stream error'
        loading.value = false
        emit('error', normalizedFallbackError)
      })
      return
    }

    error.value = normalizedError?.message || 'Stream error'
    loading.value = false
    emit('error', normalizedError)
  })

  const finalUrl = shouldProxyRequest() ? buildProxyUrl(url) : url
  await shakaPlayer.load(finalUrl)
  loading.value = false
  emit('ready')
  await playMedia()

  const tracks = shakaPlayer.getVariantTracks()
  const streamQualities = tracks
    .map(track => track.height ? `${track.height}p` : null)
    .filter(Boolean)

  qualities.value = ['Auto', ...new Set(streamQualities)]
}

const loadJWPlayerScript = () => new Promise((resolve, reject) => {
  if (window.jwplayer) {
    resolve(window.jwplayer)
    return
  }

  const existingScript = document.querySelector(`script[src="${JW_PLAYER_SCRIPT_URL}"]`)
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(window.jwplayer), { once: true })
    existingScript.addEventListener('error', reject, { once: true })
    return
  }

  const script = document.createElement('script')
  script.src = JW_PLAYER_SCRIPT_URL
  script.async = true
  script.onload = () => resolve(window.jwplayer)
  script.onerror = reject
  document.head.appendChild(script)
})

const buildJWDrmConfig = () => {
  if (props.stream?.drm?.type === 'clearkey' && props.stream.drm.clearKeys) {
    return {
      clearkey: normalizeClearKeys(props.stream.drm.clearKeys)
    }
  }

  if (props.stream?.drm?.type === 'widevine' && props.stream.drm.licenseUrl) {
    return {
      widevine: {
        url: props.stream.drm.licenseUrl
      }
    }
  }

  return undefined
}

const fallbackToJWPlayer = async (url, originalError) => {
  handlingFallback = true
  destroyPlayer({ keepVideoSrc: false })

  const jw = await loadJWPlayerScript()
  jw.key = JW_PLAYER_KEY

  const finalUrl = shouldProxyRequest() ? buildProxyUrl(url) : url
  const streamType = detectStreamType()
  const sourceType = streamType === 'dash' ? 'dash' : streamType === 'hls' ? 'hls' : undefined

  videoElement.value.classList.add('hidden')
  jwContainer.value.classList.remove('hidden')

  jwPlayer = jw(jwContainer.value)
  jwPlayer.setup({
    file: finalUrl,
    type: sourceType,
    autostart: true,
    mute: videoElement.value?.muted || false,
    width: '100%',
    aspectratio: '16:9',
    drm: buildJWDrmConfig()
  })

  await new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(originalError || new Error('JW Player fallback timed out.'))
    }, 15000)

    jwPlayer.once('play', () => {
      window.clearTimeout(timeout)
      resolve()
    })

    jwPlayer.once('error', (event) => {
      window.clearTimeout(timeout)
      reject(new Error(event?.message || 'JW Player fallback failed.'))
    })
  })

  loading.value = false
  error.value = null
  emit('ready')
}

const initializeDirectPlayback = async (url) => {
  const finalUrl = shouldProxyRequest() ? buildProxyUrl(url) : url

  const onLoadedMetadata = async () => {
    videoElement.value.removeEventListener('loadedmetadata', onLoadedMetadata)
    loading.value = false
    emit('ready')
    await playMedia()
  }

  videoElement.value.addEventListener('loadedmetadata', onLoadedMetadata)
  videoElement.value.src = finalUrl
  videoElement.value.load()
}

const destroyPlayer = ({ keepVideoSrc = false } = {}) => {
  if (hls) {
    hls.destroy()
    hls = null
  }

  if (shakaPlayer) {
    shakaPlayer.destroy()
    shakaPlayer = null
  }

  if (jwPlayer) {
    jwPlayer.remove()
    jwPlayer = null
  }

  if (jwContainer.value) {
    jwContainer.value.classList.add('hidden')
  }

  if (videoElement.value) {
    videoElement.value.classList.remove('hidden')
  }

  if (videoElement.value && !keepVideoSrc) {
    videoElement.value.pause()
    videoElement.value.removeAttribute('src')
    videoElement.value.load()
  }
}

const setupEventListeners = () => {
  const video = videoElement.value

  // Restore the user's mute/volume preference (persists across server switches).
  const savedMuted = localStorage.getItem('fm_player_muted')
  const savedVolume = localStorage.getItem('fm_player_volume')
  if (savedMuted !== null) video.muted = savedMuted === '1'
  if (savedVolume !== null) video.volume = parseFloat(savedVolume)
  isMuted.value = video.muted
  volume.value = video.volume

  video.addEventListener('play', () => {
    isPlaying.value = true
  })

  video.addEventListener('pause', () => {
    isPlaying.value = false
  })

  // Show the branded loading screen until real frames render, and again while
  // the stream re-buffers (avoids a plain black screen during loading).
  video.addEventListener('waiting', () => { loading.value = true })
  video.addEventListener('stalled', () => { loading.value = true })
  video.addEventListener('playing', () => {
    loading.value = false
    autoRetryCount.value = 0 // stream is healthy again
  })

  video.addEventListener('timeupdate', () => {
    currentTime.value = video.currentTime
    progress.value = video.duration ? (video.currentTime / video.duration) * 100 : 0
  })

  video.addEventListener('loadedmetadata', () => {
    duration.value = video.duration
  })

  video.addEventListener('volumechange', () => {
    volume.value = video.volume
    isMuted.value = video.muted
    // Remember the preference so it carries over to the next server/stream.
    localStorage.setItem('fm_player_muted', video.muted ? '1' : '0')
    localStorage.setItem('fm_player_volume', String(video.volume))
  })

  document.addEventListener('fullscreenchange', handleFullscreenChange)
}

onMounted(() => {
  setupEventListeners()
  initializePlayer()
})

onUnmounted(() => {
  clearTimeout(controlsTimeout)
  clearTimeout(autoRetryTimer)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  destroyPlayer()
})

watch(() => props.stream, () => {
  if (!videoElement.value) return
  autoRetryCount.value = 0 // fresh stream → allow auto-retries again
  destroyPlayer()
  initializePlayer()
}, { deep: true })

const togglePlay = () => {
  if (videoElement.value.paused) {
    videoElement.value.play()
  } else {
    videoElement.value.pause()
  }
}

const toggleMute = () => {
  videoElement.value.muted = !videoElement.value.muted
}

const setVolume = () => {
  videoElement.value.volume = volume.value
}

const seek = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  videoElement.value.currentTime = percent * videoElement.value.duration
}

// TV/keyboard seek: ←/→ jump 10s (only meaningful for VOD with a real duration).
const seekBy = (seconds) => {
  const v = videoElement.value
  if (!v || !isFinite(v.duration) || v.duration <= 0) return
  v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + seconds))
}

const setQuality = (quality) => {
  currentQuality.value = quality
  showQualityMenu.value = false

  if (hls && quality !== 'Auto') {
    const height = parseInt(quality)
    const level = hls.levels.findIndex(l => l.height === height)
    if (level !== -1) {
      hls.currentLevel = level
    }
  } else if (hls) {
    hls.currentLevel = -1 // Auto
  }

  if (shakaPlayer && quality !== 'Auto') {
    const height = parseInt(quality)
    const tracks = shakaPlayer.getVariantTracks()
    const track = tracks.find(t => t.height === height)
    if (track) {
      shakaPlayer.selectVariantTrack(track)
    }
  } else if (shakaPlayer) {
    shakaPlayer.configure({ abr: { enabled: true } })
  }
}

const setPlaybackSpeed = (speed) => {
  playbackSpeed.value = speed
  showSpeedMenu.value = false
  videoElement.value.playbackRate = speed
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    videoElement.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const showControls = () => {
  controlsVisible.value = true
  clearTimeout(controlsTimeout)
  controlsTimeout = setTimeout(() => {
    if (isPlaying.value) {
      controlsVisible.value = false
    }
  }, 3000)
}

const hideControls = () => {
  if (isPlaying.value) {
    controlsVisible.value = false
  }
}

const handleError = (e) => {
  if (jwPlayer) {
    return
  }

  const nativeVideoError = formatNativeVideoError()

  if (!error.value) {
    error.value = nativeVideoError.message
  }

  loading.value = false
  emit('error', {
    ...nativeVideoError,
    originalEvent: e
  })
}

const retry = () => {
  error.value = null
  destroyPlayer()
  initializePlayer()
}

// Manual retry from the error overlay — reset the auto-retry budget.
const manualRetry = () => {
  autoRetryCount.value = 0
  retry()
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>
