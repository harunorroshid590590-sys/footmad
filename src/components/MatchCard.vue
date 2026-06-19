<template>
  <router-link
    :to="`/watch/${match.id}`"
    class="block group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
  >
    <!-- Glassmorphism overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div class="relative p-6">
      <!-- Top Badges -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <!-- Live Badge -->
          <span
            v-if="isLive"
            class="flex items-center space-x-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full"
          >
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span>LIVE</span>
          </span>
          <!-- Upcoming Badge -->
          <span
            v-else
            class="bg-slate-700/50 border border-slate-600/50 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full"
          >
            {{ formatTime(match.startTime) }}
          </span>
          <!-- Category Badge -->
          <span class="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            {{ match.category }}
          </span>
        </div>
        <!-- Hot Badge -->
        <span
          v-if="match.isHot"
          class="flex items-center space-x-1 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full"
        >
          <span>🔥</span>
          <span>HOT</span>
        </span>
      </div>

      <!-- Teams Section -->
      <div class="flex items-center justify-between mb-6">
        <!-- Home Team -->
        <div class="flex-1 text-center">
          <div class="w-16 h-16 mx-auto mb-3 bg-slate-800/50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700/50 group-hover:border-purple-500/30 transition-colors">
            <img 
              v-if="match.homeLogo" 
              :src="match.homeLogo" 
              :alt="match.homeTeam"
              loading="lazy"
              class="w-full h-full object-contain p-2"
              @error="handleImageError($event, 'home')"
            />
            <span v-else class="text-2xl">⚽</span>
          </div>
          <h3 class="text-white font-semibold text-sm truncate px-2">{{ match.homeTeam }}</h3>
        </div>

        <!-- VS -->
        <div class="px-4">
          <div class="text-slate-400 font-bold text-lg">VS</div>
        </div>

        <!-- Away Team -->
        <div class="flex-1 text-center">
          <div class="w-16 h-16 mx-auto mb-3 bg-slate-800/50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700/50 group-hover:border-purple-500/30 transition-colors">
            <img 
              v-if="match.awayLogo" 
              :src="match.awayLogo" 
              :alt="match.awayTeam"
              loading="lazy"
              class="w-full h-full object-contain p-2"
              @error="handleImageError($event, 'away')"
            />
            <span v-else class="text-2xl">⚽</span>
          </div>
          <h3 class="text-white font-semibold text-sm truncate px-2">{{ match.awayTeam }}</h3>
        </div>
      </div>

      <!-- Bottom Info -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-slate-400 text-xs truncate max-w-[150px]">{{ match.eventName || match.category }}</span>
        </div>
        <div class="flex items-center space-x-1.5 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50">
          <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span class="text-purple-300 text-xs font-semibold">{{ match.streamsCount || 0 }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  match: {
    type: Object,
    required: true
  }
})

const isLive = computed(() => {
  if (!props.match.startTime || !props.match.endTime) return false
  const now = new Date()
  const start = new Date(props.match.startTime)
  const end = new Date(props.match.endTime)
  return now >= start && now <= end
})

const formatTime = (time) => {
  if (!time) return 'TBD'
  const date = new Date(time)
  const now = new Date()
  const diff = date - now
  
  if (diff < 0) return 'LIVE'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

const handleImageError = (event, team) => {
  event.target.parentElement.innerHTML = '<span class="text-2xl">⚽</span>'
}
</script>
