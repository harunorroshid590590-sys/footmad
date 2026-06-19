<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="goBack"
          class="flex items-center space-x-2 text-text-muted hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        
        <button
          @click="toggleFavorite"
          class="p-2 rounded-lg transition-colors"
          :class="isFavorite ? 'text-primary' : 'text-text-muted hover:text-white'"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              v-if="isFavorite"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
            <path
              v-else
              d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
            />
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !match" class="text-center py-20">
        <p class="text-text-muted mb-4">{{ error || 'Match not found' }}</p>
        <button
          @click="goBack"
          class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>

      <!-- Match Content -->
      <div v-else>
        <!-- Video Player -->
        <VideoPlayer
          :stream="currentStream"
          :is-live="isLive"
          @error="handlePlayerError"
          @ready="handlePlayerReady"
        />

        <!-- Server Switcher -->
        <ServerSwitcher
          v-if="match.streams && match.streams.length > 0"
          :streams="match.streams"
          :initial-stream="currentStream"
          @server-selected="handleServerChange"
        />

        <!-- Match Info Card -->
        <div class="mt-6 bg-card rounded-xl neon-border p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10 bg-card rounded-full flex items-center justify-center">
                <span class="text-sm font-bold text-primary">{{ match.category?.substring(0, 2) || 'SP' }}</span>
              </div>
              <span class="text-text-muted text-sm">{{ match.category || 'Sports' }}</span>
            </div>
            <span
              v-if="isLive"
              class="live-badge flex items-center space-x-1"
            >
              <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>LIVE NOW</span>
            </span>
          </div>

          <h2 class="text-white text-lg font-semibold mb-2">{{ match.league || 'Match' }}</h2>
          <p class="text-text-muted text-sm mb-4">{{ formatDateTime(match.time) }}</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-16 h-16 bg-card rounded-full flex items-center justify-center overflow-hidden">
                <img
                  v-if="match.homeTeam?.logo"
                  :src="match.homeTeam.logo"
                  :alt="match.homeTeam.name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-text-muted text-sm">{{ match.homeTeam?.name?.substring(0, 2) || 'HT' }}</span>
              </div>
              <span class="text-white font-semibold">{{ match.homeTeam?.name || 'Home Team' }}</span>
            </div>

            <div class="px-6">
              <span class="text-primary text-2xl font-bold">VS</span>
            </div>

            <div class="flex items-center space-x-3">
              <span class="text-white font-semibold">{{ match.awayTeam?.name || 'Away Team' }}</span>
              <div class="w-16 h-16 bg-card rounded-full flex items-center justify-center overflow-hidden">
                <img
                  v-if="match.awayTeam?.logo"
                  :src="match.awayTeam.logo"
                  :alt="match.awayTeam.name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-text-muted text-sm">{{ match.awayTeam?.name?.substring(0, 2) || 'AT' }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span class="text-text-muted text-sm">{{ match.streams?.length || 0 }} servers available</span>
            <div class="flex items-center space-x-1 text-text-muted text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ formatTime(match.time) }}</span>
            </div>
          </div>
        </div>

        <!-- More Matches Section -->
        <div class="mt-8">
          <h3 class="text-white font-semibold mb-4 flex items-center space-x-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>More Matches</span>
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MatchCard
              v-for="relatedMatch in relatedMatches"
              :key="relatedMatch._id"
              :match="relatedMatch"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ServerSwitcher from '@/components/ServerSwitcher.vue'
import MatchCard from '@/components/MatchCard.vue'

const route = useRoute()
const router = useRouter()
const matchesStore = useMatchesStore()

const loading = ref(true)
const error = ref(null)
const currentStream = ref(null)

const match = computed(() => matchesStore.getMatchById(route.params.id))
const isLive = computed(() => {
  if (!match.value) return false
  if (match.value.status === 'live') return true
  const matchTime = new Date(match.value.time)
  const now = new Date()
  const endTime = new Date(matchTime.getTime() + 3 * 60 * 60 * 1000)
  return matchTime <= now && endTime >= now
})

const isFavorite = computed(() => {
  if (!match.value) return false
  return matchesStore.isFavorite(match.value._id)
})

const relatedMatches = computed(() => {
  if (!match.value) return []
  return matchesStore.matches
    .filter(m => m._id !== match.value._id && m.category === match.value.category)
    .slice(0, 4)
})

const goBack = () => {
  router.back()
}

const toggleFavorite = () => {
  if (match.value) {
    matchesStore.toggleFavorite(match.value._id)
  }
}

const handleServerChange = (stream) => {
  currentStream.value = stream
}

const handlePlayerError = (err) => {
  console.error('Player error:', err)
}

const handlePlayerReady = () => {
  console.log('Player ready')
}

const formatDateTime = (time) => {
  const date = new Date(time)
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return date.toLocaleDateString('en-US', options)
}

const formatTime = (time) => {
  const date = new Date(time)
  const options = { hour: '2-digit', minute: '2-digit' }
  return date.toLocaleTimeString('en-US', options)
}

onMounted(async () => {
  loading.value = true
  try {
    await matchesStore.fetchMatches()
    
    if (match.value && match.value.streams && match.value.streams.length > 0) {
      currentStream.value = match.value.streams[0]
    }
    
    loading.value = false
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
})
</script>
