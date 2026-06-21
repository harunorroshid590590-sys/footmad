<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
        <div class="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-text-muted">Loading channel...</p>
      </div>

      <!-- Error / not found -->
      <div v-else-if="error || !channel" class="flex flex-col items-center justify-center py-24 text-center">
        <p class="text-white text-lg font-semibold mb-2">{{ error || 'Channel not found' }}</p>
        <router-link to="/channels" class="text-primary-light hover:underline">Back to channels</router-link>
      </div>

      <div v-else class="max-w-5xl mx-auto">
        <!-- Player -->
        <div tabindex="0" data-focus-default class="relative bg-black rounded-2xl overflow-hidden shadow-card outline-none aspect-video">
          <VideoPlayer
            v-if="currentServer"
            :key="`${channel._id}-${currentIndex}-${reloadKey}`"
            :stream="currentServer"
            :is-live="true"
            @error="handlePlayerError"
            @ready="handlePlayerReady"
          />
          <div v-else class="aspect-video flex items-center justify-center text-text-muted">
            No streams available for this channel.
          </div>

          <PlayerOverlay
            v-if="playerError || retrying"
            :state="playerError ? 'error' : 'connecting'"
            :message="errorMessage"
            :server-name="currentServer?.title"
            :has-next="false"
            @retry="retryCurrent"
          />
        </div>

        <!-- Server tabs -->
        <div class="mt-4">
          <ServerTabs :servers="servers" :current="currentIndex" @select="selectServer" />
        </div>

        <!-- Admin banner -->
        <div class="mt-5"><WatchBanner /></div>

        <!-- Channel header -->
        <div class="mt-2 flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center shrink-0">
            <img v-if="logoUrl && !logoErr" :src="logoUrl" :alt="channel.name" class="w-full h-full object-cover" @error="logoErr = true" />
            <span v-else class="text-xs font-bold text-text-muted">{{ channel.name?.slice(0, 3).toUpperCase() }}</span>
          </div>
          <div class="min-w-0">
            <h1 class="text-white font-bold truncate">{{ channel.name }}</h1>
            <p class="text-text-muted text-xs">{{ channel.category || 'Sports' }} · {{ servers.length }} server{{ servers.length === 1 ? '' : 's' }}</p>
          </div>
          <button @click="shareChannel" class="ml-auto p-2 rounded-lg bg-surface hover:bg-card-hover transition-colors" title="Share">
            <svg class="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.7 10.7l6.6-3.4M8.7 13.3l6.6 3.4M18 8a3 3 0 10-3-3 3 3 0 003 3zM6 15a3 3 0 100-6 3 3 0 000 6zm12 7a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import VideoPlayer from '@/components/VideoPlayer.vue'
import PlayerOverlay from '@/components/PlayerOverlay.vue'
import ServerTabs from '@/components/ServerTabs.vue'
import WatchBanner from '@/components/WatchBanner.vue'
import { normalizeServers } from '@/utils/stream'
import { resolveAsset } from '@/utils/assets'
import { friendlyStreamError } from '@/utils/playerError'

const route = useRoute()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

const channel = ref(null)
const loading = ref(true)
const error = ref(null)
const playerError = ref(false)
const errorMessage = ref('')
const reloadKey = ref(0)
const retrying = ref(false)
const retryAttempts = ref(0)
const MAX_RETRIES = 2
const currentIndex = ref(0)
const logoErr = ref(false)

const servers = computed(() => normalizeServers(channel.value?.servers || []))
const currentServer = computed(() => servers.value[currentIndex.value] || null)
const logoUrl = computed(() => resolveAsset(channel.value?.logo))

const loadChannel = async () => {
  loading.value = true
  error.value = null
  playerError.value = false
  retrying.value = false
  retryAttempts.value = 0
  currentIndex.value = 0
  try {
    const { data } = await axios.get(`${API_URL}/channels/${route.params.id}`)
    channel.value = data
  } catch (err) {
    channel.value = null
    error.value = err.response?.status === 404 ? 'Channel not found' : (err.response?.data?.message || 'Failed to load channel')
  } finally {
    loading.value = false
  }
}

const selectServer = (index) => {
  currentIndex.value = index
  playerError.value = false
  retrying.value = false
  retryAttempts.value = 0
}

const tryNextServer = () => {
  if (currentIndex.value < servers.value.length - 1) {
    currentIndex.value += 1
    playerError.value = false
    retryAttempts.value = 0
  }
}

const retryCurrent = () => {
  playerError.value = false
  retrying.value = true
  retryAttempts.value = 0
  reloadKey.value += 1
}

const handlePlayerError = (issue) => {
  const detail = issue?.details || issue?.message || ''
  const isLast = currentIndex.value >= servers.value.length - 1

  // Other servers available → fail over quickly.
  if (!isLast) {
    retrying.value = true
    tryNextServer()
    return
  }

  // Last/only server → retry transient errors a couple of times before failing.
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

const shareChannel = async () => {
  const url = window.location.href
  try {
    if (navigator.share) await navigator.share({ title: channel.value?.name, url })
    else await navigator.clipboard.writeText(url)
  } catch { /* user cancelled */ }
}

watch(() => route.params.id, loadChannel)
onMounted(loadChannel)
</script>
