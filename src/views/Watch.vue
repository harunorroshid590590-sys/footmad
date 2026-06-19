<template>
  <div class="min-h-screen bg-slate-950">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-white text-lg">Loading match...</p>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-white text-lg font-semibold mb-2">{{ error }}</p>
        <button
          @click="loadMatch"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>

      <div v-else-if="!match" class="flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-white text-lg font-semibold mb-2">Match not found</p>
        <router-link to="/" class="text-purple-400 hover:text-purple-300">Return to Home</router-link>
      </div>

      <div v-else-if="servers.length === 0" class="flex flex-col items-center justify-center py-20">
        <svg class="w-16 h-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <p class="text-white text-lg font-semibold mb-2">No streams available</p>
        <p class="text-slate-400 text-sm mb-4">This match has no active servers right now.</p>
        <button
          @click="loadMatch"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <div class="relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10">
            <VideoPlayer
              v-if="currentStream"
              :key="`${match.id}-${currentServerIndex}`"
              :stream="currentStream"
              :is-live="match.isLive"
              @error="handlePlayerError"
              @ready="handlePlayerReady"
            />

            <div v-if="playerError" class="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6">
              <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-white text-lg font-semibold mb-2">Stream unavailable</p>
              <p class="text-slate-400 text-sm text-center mb-4">{{ playerError }}</p>
              <button
                @click="tryNextServer"
                class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Next Server
              </button>
            </div>
          </div>

          <div class="mt-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <span
                  v-if="match.isLive"
                  class="flex items-center space-x-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span>LIVE</span>
                </span>
                <span class="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {{ match.category || 'Sports' }}
                </span>
              </div>

              <div class="flex items-center space-x-2">
                <button
                  @click="copyStreamLink"
                  class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy Stream Link"
                >
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  @click="openExternalPlayer"
                  class="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Open in External Player"
                >
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center space-x-4 min-w-0">
                <div class="flex items-center space-x-3 min-w-0">
                  <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      v-if="match.homeLogo"
                      :src="match.homeLogo"
                      :alt="match.homeTeam"
                      loading="lazy"
                      class="w-full h-full object-contain p-1"
                      @error="handleImageError"
                    />
                    <span v-else class="text-xs font-semibold text-slate-300">TV</span>
                  </div>
                  <span class="text-white font-semibold truncate">{{ match.homeTeam || 'Home Team' }}</span>
                </div>

                <span class="text-slate-400 font-bold text-xl">VS</span>

                <div class="flex items-center space-x-3 min-w-0">
                  <span class="text-white font-semibold truncate">{{ match.awayTeam || 'Away Team' }}</span>
                  <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      v-if="match.awayLogo"
                      :src="match.awayLogo"
                      :alt="match.awayTeam"
                      loading="lazy"
                      class="w-full h-full object-contain p-1"
                      @error="handleImageError"
                    />
                    <span v-else class="text-xs font-semibold text-slate-300">TV</span>
                  </div>
                </div>
              </div>

              <div class="text-right shrink-0">
                <p class="text-slate-300 text-sm">{{ match.eventName || match.category || 'Sports Event' }}</p>
                <p class="text-slate-500 text-xs mt-1">{{ formatMatchTime(match.startTime) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 sticky top-24">
            <h3 class="text-white font-semibold mb-4">Available Servers</h3>

            <div class="space-y-2">
              <button
                v-for="(server, index) in servers"
                :key="`${server.title}-${index}`"
                @click="switchServer(index)"
                :class="[
                  'w-full p-3 rounded-xl text-left transition-all duration-300',
                  currentServerIndex === index
                    ? 'bg-purple-600/20 border border-purple-500/50'
                    : 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/30'
                ]"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center space-x-3 min-w-0">
                    <div
                      :class="[
                        'w-2 h-2 rounded-full shrink-0',
                        currentServerIndex === index ? 'bg-green-500' : 'bg-slate-500'
                      ]"
                    ></div>
                    <span class="text-white text-sm font-medium truncate">{{ server.title || `Server ${index + 1}` }}</span>
                  </div>
                  <span class="text-slate-400 text-xs uppercase shrink-0">{{ server.type }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Navbar from '@/components/Navbar.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'

const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

const match = ref(null)
const loading = ref(true)
const error = ref(null)
const playerError = ref(null)
const currentServerIndex = ref(0)

const detectStreamType = (url = '', type = '') => {
  const normalizedUrl = String(url).toLowerCase()
  const normalizedType = String(type).toLowerCase()

  if (normalizedUrl.includes('.m3u8')) return 'hls'
  if (normalizedUrl.includes('.mpd')) return 'dash'
  if (normalizedUrl.includes('.ts')) return 'ts'
  if (['hls', 'dash', 'ts', 'direct'].includes(normalizedType)) return normalizedType
  if (normalizedType === '1') return 'dash'
  if (normalizedType === '0') return 'hls'
  if (normalizedType === '2') return 'ts'

  return 'direct'
}

const isValidHexString = (value = '') => {
  const normalized = String(value || '').replace(/\s+/g, '').trim()
  return normalized.length > 0 && normalized.length % 2 === 0 && /^[0-9a-f]+$/i.test(normalized)
}

const buildDrmFromKey = (drmKey = '', existingDrm = null) => {
  if (existingDrm?.type === 'clearkey' && existingDrm.clearKeys) {
    const entries = Object.entries(existingDrm.clearKeys)
    const hasInvalidEntry = entries.some(([keyId, key]) => !isValidHexString(keyId) || !isValidHexString(key))

    if (!hasInvalidEntry && entries.length > 0) {
      return existingDrm
    }
  }

  if (existingDrm?.type === 'widevine' && existingDrm.licenseUrl) {
    return existingDrm
  }

  const value = String(drmKey || '').replace(/\s+/g, '').trim()
  if (!value) return null

  if (/^https?:\/\//i.test(value)) {
    return {
      type: 'widevine',
      licenseUrl: value
    }
  }

  const parts = value.split(':')
  if (parts.length === 2) {
    if (isValidHexString(parts[0]) && isValidHexString(parts[1])) {
      return {
        type: 'clearkey',
        clearKeys: {
          [parts[0].trim()]: parts[1].trim()
        }
      }
    }

    return null
  }

  return null
}

const normalizeServer = (server = {}, index = 0) => {
  const url =
    server.url ||
    server.streamUrl ||
    server.externalUrl ||
    server.link ||
    server.src ||
    ''
  const drm = buildDrmFromKey(server.drmKey, server.drm)
  const drmError = drm ? server.drmError : null

  return {
    ...server,
    id: server.id || `${index}`,
    title: server.title || server.name || `Server ${index + 1}`,
    name: server.name || server.title || `Server ${index + 1}`,
    url,
    streamUrl: url,
    externalUrl: server.externalUrl || url,
    type: detectStreamType(url, server.type || server.providerType),
    drm,
    drmError,
    headers: server.headers || {},
    referer: server.referer || server.headers?.Referer || '',
    origin: server.origin || server.headers?.Origin || '',
    userAgent: server.userAgent || server.headers?.['User-Agent'] || '',
    useProxy: server.useProxy !== false
  }
}

const normalizeMatch = (payload) => {
  const rawMatch = payload?.match || payload?.data || payload
  if (!rawMatch) return null

  const rawServers = Array.isArray(rawMatch.servers) ? rawMatch.servers : []

  return {
    ...rawMatch,
    servers: rawServers
      .map((server, index) => normalizeServer(server, index))
      .filter(server => Boolean(server.url))
  }
}

const servers = computed(() => match.value?.servers || [])
const currentStream = computed(() => servers.value[currentServerIndex.value] || null)

const loadMatch = async () => {
  const matchId = route.params.id

  if (!matchId) {
    error.value = 'Invalid match ID'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  playerError.value = null
  currentServerIndex.value = 0

  try {
    const response = await axios.get(`${API_URL}/matches/${matchId}`)
    const normalizedMatch = normalizeMatch(response.data)

    if (!normalizedMatch) {
      error.value = 'Match not found'
      match.value = null
      return
    }

    match.value = normalizedMatch
  } catch (requestError) {
    match.value = null
    if (requestError.response?.status === 404) {
      error.value = 'Match not found'
    } else {
      error.value = requestError.response?.data?.message || 'Failed to load match'
    }
  } finally {
    loading.value = false
  }
}

const switchServer = (index) => {
  currentServerIndex.value = index
  playerError.value = null
}

const tryNextServer = () => {
  if (currentServerIndex.value < servers.value.length - 1) {
    currentServerIndex.value += 1
    playerError.value = null
    return
  }

  playerError.value = 'All available servers failed to load for this match.'
}

const handlePlayerError = (playerIssue) => {
  const serverName = currentStream.value?.title || 'This server'
  const detail =
    playerIssue?.details ||
    playerIssue?.message ||
    playerIssue?.data?.message ||
    'could not be played.'

  playerError.value = `${serverName} could not be played. ${detail}`

  if (currentServerIndex.value < servers.value.length - 1) {
    window.setTimeout(() => {
      if (playerError.value) {
        tryNextServer()
      }
    }, 300)
  }
}

const handlePlayerReady = () => {
  playerError.value = null
}

const copyStreamLink = async () => {
  const url = currentStream.value?.externalUrl || currentStream.value?.url
  if (!url) return

  try {
    await navigator.clipboard.writeText(url)
  } catch (copyError) {
    console.error('Failed to copy stream link:', copyError)
  }
}

const openExternalPlayer = () => {
  const url = currentStream.value?.externalUrl || currentStream.value?.url
  if (!url) return
  window.open(url, '_blank', 'noopener')
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const formatMatchTime = (value) => {
  if (!value) return 'Schedule unavailable'

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return 'Schedule unavailable'

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(() => route.params.id, () => {
  loadMatch()
})

onMounted(() => {
  loadMatch()
})
</script>
