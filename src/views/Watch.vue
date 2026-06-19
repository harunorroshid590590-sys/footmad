<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
        <div class="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-text-muted">Loading match...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-24 text-center">
        <p class="text-white text-lg font-semibold mb-2">{{ error }}</p>
        <button @click="loadMatch" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">Retry</button>
      </div>

      <!-- Not found -->
      <div v-else-if="!match" class="flex flex-col items-center justify-center py-24 text-center">
        <p class="text-white text-lg font-semibold mb-2">Match not found</p>
        <router-link to="/" class="text-primary-light hover:underline">Return home</router-link>
      </div>

      <!-- No servers -->
      <div v-else-if="servers.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <p class="text-white text-lg font-semibold mb-2">No streams available</p>
        <p class="text-text-muted text-sm mb-4">This match has no active servers right now.</p>
        <button @click="loadMatch" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">Refresh</button>
      </div>

      <!-- Player + content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Main -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Player -->
          <div tabindex="0" data-focus-default class="relative bg-black rounded-2xl overflow-hidden shadow-card outline-none">
            <VideoPlayer
              v-if="currentStream"
              :key="`${match.id}-${currentServerIndex}`"
              :stream="currentStream"
              :is-live="match.isLive"
              @error="handlePlayerError"
              @ready="handlePlayerReady"
            />
            <div v-if="playerError" class="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
              <p class="text-white text-lg font-semibold mb-2">Stream unavailable</p>
              <p class="text-text-muted text-sm mb-4">{{ playerError }}</p>
              <button @click="tryNextServer" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">Try Next Server</button>
            </div>
          </div>

          <!-- Server tabs -->
          <div v-if="servers.length" class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              v-for="(server, index) in servers"
              :key="`${server.title}-${index}`"
              @click="switchServer(index)"
              class="flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
              :class="currentServerIndex === index
                ? 'bg-card border-primary text-white'
                : 'bg-card border-border text-text-muted hover:text-white hover:border-primary/40'"
            >
              <svg v-if="currentServerIndex === index" class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span class="truncate max-w-[160px]">{{ server.title || `Server ${index + 1}` }}</span>
              <span class="text-[10px] uppercase opacity-70">{{ server.type }}</span>
            </button>
          </div>

          <!-- Match header: flags VS + share -->
          <div class="bg-card border border-border rounded-2xl p-4">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-2">
                <span v-if="match.isLive" class="flex items-center gap-1.5 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                  <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                </span>
                <span class="bg-surface border border-border text-text-muted text-xs font-semibold px-3 py-1 rounded-full">{{ match.category || 'Sports' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button @click="shareMatch" class="p-2 bg-surface hover:bg-card-hover rounded-lg transition-colors" title="Share">
                  <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.7 10.7l6.6-3.4M8.7 13.3l6.6 3.4M18 8a3 3 0 10-3-3 3 3 0 003 3zM6 15a3 3 0 100-6 3 3 0 000 6zm12 7a3 3 0 100-6 3 3 0 000 6z" /></svg>
                </button>
                <button @click="openExternalPlayer" class="p-2 bg-surface hover:bg-card-hover rounded-lg transition-colors" title="Open in external player">
                  <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-center gap-4 sm:gap-8 py-2">
              <div class="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div class="w-14 h-14 rounded-xl bg-surface border border-border overflow-hidden flex items-center justify-center">
                  <img v-if="homeFlag" :src="homeFlag" :alt="match.homeTeam" class="w-full h-full object-contain p-1" @error="homeErr = true" />
                  <span v-else class="text-2xl">🏳️</span>
                </div>
                <span class="text-white font-semibold text-sm text-center truncate w-full">{{ match.homeTeam || 'Home' }}</span>
              </div>

              <div class="flex flex-col items-center shrink-0">
                <span class="text-text-muted font-bold text-xl">VS</span>
                <span class="text-text-muted text-[11px] mt-1 whitespace-nowrap">{{ formatMatchTime(match.startTime) }}</span>
              </div>

              <div class="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div class="w-14 h-14 rounded-xl bg-surface border border-border overflow-hidden flex items-center justify-center">
                  <img v-if="awayFlag" :src="awayFlag" :alt="match.awayTeam" class="w-full h-full object-contain p-1" @error="awayErr = true" />
                  <span v-else class="text-2xl">🏳️</span>
                </div>
                <span class="text-white font-semibold text-sm text-center truncate w-full">{{ match.awayTeam || 'Away' }}</span>
              </div>
            </div>

            <p v-if="match.eventName" class="text-center text-text-muted text-xs mt-2">{{ match.eventName }}</p>
          </div>
        </div>

        <!-- Related rail -->
        <aside class="lg:col-span-1">
          <h3 class="text-white font-semibold mb-3">Up Next</h3>
          <div v-if="related.length" class="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <MatchCard v-for="m in related" :key="m.id" :match="m" />
          </div>
          <p v-else class="text-text-muted text-sm">No other matches right now.</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import VideoPlayer from '@/components/VideoPlayer.vue'
import MatchCard from '@/components/MatchCard.vue'
import { useMatchesStore } from '@/stores/matches'
import { resolveAsset } from '@/utils/assets'

const route = useRoute()
const matchesStore = useMatchesStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

const match = ref(null)
const loading = ref(true)
const error = ref(null)
const playerError = ref(null)
const currentServerIndex = ref(0)
const homeErr = ref(false)
const awayErr = ref(false)

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
    if (!hasInvalidEntry && entries.length > 0) return existingDrm
  }
  if (existingDrm?.type === 'widevine' && existingDrm.licenseUrl) return existingDrm

  const value = String(drmKey || '').replace(/\s+/g, '').trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return { type: 'widevine', licenseUrl: value }

  const parts = value.split(':')
  if (parts.length === 2) {
    if (isValidHexString(parts[0]) && isValidHexString(parts[1])) {
      return { type: 'clearkey', clearKeys: { [parts[0].trim()]: parts[1].trim() } }
    }
    return null
  }
  return null
}

const normalizeServer = (server = {}, index = 0) => {
  const url = server.url || server.streamUrl || server.externalUrl || server.link || server.src || ''
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
    servers: rawServers.map((server, index) => normalizeServer(server, index)).filter(server => Boolean(server.url))
  }
}

const servers = computed(() => match.value?.servers || [])
const currentStream = computed(() => servers.value[currentServerIndex.value] || null)

const homeFlag = computed(() => (homeErr.value ? '' : resolveAsset(match.value?.homeLogo)))
const awayFlag = computed(() => (awayErr.value ? '' : resolveAsset(match.value?.awayLogo)))

const related = computed(() =>
  matchesStore.matches.filter((m) => String(m.id) !== String(match.value?.id)).slice(0, 8)
)

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
  homeErr.value = false
  awayErr.value = false

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
    if (requestError.response?.status === 404) error.value = 'Match not found'
    else error.value = requestError.response?.data?.message || 'Failed to load match'
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
  const detail = playerIssue?.details || playerIssue?.message || playerIssue?.data?.message || 'could not be played.'
  playerError.value = `${serverName} could not be played. ${detail}`
  if (currentServerIndex.value < servers.value.length - 1) {
    window.setTimeout(() => {
      if (playerError.value) tryNextServer()
    }, 300)
  }
}

const handlePlayerReady = () => {
  playerError.value = null
}

const shareMatch = async () => {
  const url = window.location.href
  try {
    if (navigator.share) await navigator.share({ title: `${match.value?.homeTeam} vs ${match.value?.awayTeam}`, url })
    else await navigator.clipboard.writeText(url)
  } catch { /* cancelled */ }
}

const openExternalPlayer = () => {
  const url = currentStream.value?.externalUrl || currentStream.value?.url
  if (!url) return
  window.open(url, '_blank', 'noopener')
}

const formatMatchTime = (value) => {
  if (!value) return 'Schedule TBD'
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return 'Schedule TBD'
  return parsedDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

watch(() => route.params.id, loadMatch)

onMounted(() => {
  loadMatch()
  if (matchesStore.matches.length === 0) matchesStore.fetchMatches()
})
</script>
