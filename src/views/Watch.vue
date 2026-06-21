<template>
  <div class="min-h-screen bg-background">
    <div class="px-2 sm:px-3 lg:px-4 py-4">
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
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:items-start">
        <!-- Main -->
        <div class="lg:col-span-3 space-y-4">
          <!-- Player -->
          <div
            tabindex="0"
            data-focus-default
            class="relative bg-black overflow-hidden shadow-card outline-none"
            :class="showPreroll ? 'aspect-video' : ''"
          >
            <VideoPlayer
              v-if="currentStream && !showPreroll"
              :key="`${match.id}-${currentServerIndex}-${reloadKey}`"
              :stream="currentStream"
              :is-live="match.isLive"
              @error="handlePlayerError"
              @ready="handlePlayerReady"
            />
            <PlayerOverlay
              v-if="!showPreroll && (playerError || retrying)"
              :state="playerError ? 'error' : 'connecting'"
              :message="errorMessage"
              :server-name="currentStream?.title"
              :has-next="false"
              @retry="retryCurrent"
            />
            <!-- Pre-roll ad: plays before the stream, each time the match opens -->
            <PrerollAd v-if="showPreroll" @complete="onPrerollDone" />
          </div>

          <!-- Server tabs (TV-remote navigable: ←/→ to move, OK to switch) -->
          <ServerTabs :servers="servers" :current="currentServerIndex" @select="switchServer" />

          <!-- Admin banner for this match (clickable to its link) -->
          <component
            v-if="matchBannerUrl"
            :is="match.bannerLink ? 'a' : 'div'"
            :href="match.bannerLink || undefined"
            :target="match.bannerLink ? '_blank' : undefined"
            rel="noopener"
            class="block rounded-xl overflow-hidden border border-border mb-4 w-full h-20 sm:h-24"
            :class="match.bannerLink ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''"
          >
            <img :src="matchBannerUrl" alt="Banner" class="block w-full h-full object-cover" />
          </component>

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

        <!-- Related rail (scrolls independently on desktop) -->
        <aside class="lg:col-span-1 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <h3 class="text-white font-semibold mb-3 lg:sticky lg:top-0 lg:bg-background lg:py-1 lg:z-10">Up Next</h3>
          <div v-if="related.length" class="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <MatchCard v-for="m in related" :key="m.id" :match="m" compact />
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
import PlayerOverlay from '@/components/PlayerOverlay.vue'
import PrerollAd from '@/components/PrerollAd.vue'
import ServerTabs from '@/components/ServerTabs.vue'
import MatchCard from '@/components/MatchCard.vue'
import { useMatchesStore } from '@/stores/matches'
import { resolveAsset } from '@/utils/assets'
import { friendlyStreamError } from '@/utils/playerError'
import { sortByPriority } from '@/utils/matchStatus'

const route = useRoute()
const matchesStore = useMatchesStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

const match = ref(null)
const loading = ref(true)
const error = ref(null)
const playerError = ref(false)
const errorMessage = ref('')
const reloadKey = ref(0)
const retrying = ref(false)
const retryAttempts = ref(0)
const MAX_RETRIES = 2 // silent retries on the last server before giving up
const currentServerIndex = ref(0)
const homeErr = ref(false)
const awayErr = ref(false)
const showPreroll = ref(false)

const onPrerollDone = () => { showPreroll.value = false }

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
const matchBannerUrl = computed(() => resolveAsset(match.value?.banner))

// All other matches, in the same priority order as the home page
// (pinned → live → upcoming → ended).
const related = computed(() =>
  sortByPriority(
    matchesStore.matches.filter((m) => String(m.id) !== String(match.value?.id))
  )
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
  playerError.value = false
  retrying.value = false
  retryAttempts.value = 0
  currentServerIndex.value = 0
  homeErr.value = false
  awayErr.value = false
  showPreroll.value = false

  try {
    const response = await axios.get(`${API_URL}/matches/${matchId}`)
    const normalizedMatch = normalizeMatch(response.data)
    if (!normalizedMatch) {
      error.value = 'Match not found'
      match.value = null
      return
    }
    match.value = normalizedMatch
    // Play the pre-roll ad (if configured) before the stream starts.
    if (normalizedMatch.servers?.length) showPreroll.value = true
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
  playerError.value = false
  retrying.value = false
  retryAttempts.value = 0
}

const tryNextServer = () => {
  if (currentServerIndex.value < servers.value.length - 1) {
    currentServerIndex.value += 1
    playerError.value = false
    retryAttempts.value = 0
  }
}

const retryCurrent = () => {
  playerError.value = false
  retrying.value = true
  retryAttempts.value = 0
  reloadKey.value += 1 // force the player to remount and reload the same server
}

const handlePlayerError = (playerIssue) => {
  const detail = playerIssue?.details || playerIssue?.message || playerIssue?.data?.message || ''
  const isLast = currentServerIndex.value >= servers.value.length - 1

  // Other servers available → fail over quickly.
  if (!isLast) {
    retrying.value = true
    tryNextServer()
    return
  }

  // Last/only server → transient errors (e.g. live-stream startup, JW 102630)
  // often recover, so silently retry a couple of times before showing an error.
  if (retryAttempts.value < MAX_RETRIES) {
    retryAttempts.value += 1
    retrying.value = true
    playerError.value = false
    window.setTimeout(() => { reloadKey.value += 1 }, 1500)
    return
  }

  retrying.value = false
  errorMessage.value = friendlyStreamError(detail)
  playerError.value = true
}

const handlePlayerReady = () => {
  playerError.value = false
  retrying.value = false
  retryAttempts.value = 0
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
