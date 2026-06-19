<template>
  <router-link
    :to="`/watch/${match.id}`"
    class="group block rounded-xl overflow-hidden bg-black border border-border hover:border-border-strong transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
  >
    <!-- Poster area -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="bannerUrl && !bannerErr"
        :src="bannerUrl"
        :alt="matchup"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="bannerErr = true"
      />
      <MatchPoster v-else :match="match" />

      <!-- Status badge -->
      <span
        v-if="isLive"
        class="absolute top-2 right-2 flex items-center gap-1 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow"
      >
        <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        LIVE
      </span>
      <span
        v-else-if="isUpcoming"
        class="absolute top-2 right-2 bg-accent/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow"
      >
        COMING SOON
      </span>
    </div>

    <!-- Footer bar -->
    <div class="bg-black px-3 py-2.5">
      <h3 class="text-white font-extrabold text-sm sm:text-base leading-tight truncate">{{ matchup }}</h3>
      <p class="text-text-muted text-xs mt-0.5">{{ dateLabel }}</p>
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'
import MatchPoster from './MatchPoster.vue'
import { resolveAsset } from '@/utils/assets'

const props = defineProps({
  match: { type: Object, required: true },
})

const bannerErr = ref(false)
const bannerUrl = computed(() => resolveAsset(props.match.banner))

const matchup = computed(() => {
  const a = props.match.homeTeam || 'Team A'
  const b = props.match.awayTeam || 'Team B'
  return `${a} vs ${b}`
})

const isLive = computed(() => props.match.status === 'live' || props.match.isLive === true)
const isUpcoming = computed(() => {
  if (isLive.value) return false
  if (props.match.status) return props.match.status === 'upcoming'
  if (!props.match.startTime) return false
  return new Date(props.match.startTime) > new Date()
})

const dateLabel = computed(() => {
  const value = props.match.startTime
  if (!value) return 'Schedule TBD'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Schedule TBD'
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${time}`
})
</script>
