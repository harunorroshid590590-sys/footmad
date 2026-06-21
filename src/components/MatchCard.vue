<template>
  <router-link :to="`/watch/${match.id}`" class="block group">
    <!-- ===== MOBILE: full-bleed poster ===== -->
    <div class="md:hidden relative rounded-xl overflow-hidden bg-black border border-border hover:border-border-strong transition-all">
      <HotRibbon v-if="isPinned" side="left" />
      <div class="relative aspect-[16/10] overflow-hidden">
        <img
          v-if="bannerUrl && !bannerErr"
          :src="bannerUrl"
          :alt="matchup"
          loading="lazy"
          class="w-full h-full object-cover"
          @error="bannerErr = true"
        />
        <MatchPoster v-else :match="match" :compact="compact" :countdown="countdown" />

        <span
          v-if="isLive"
          class="absolute flex items-center gap-1 bg-accent text-white font-bold rounded shadow"
          :class="compact ? 'top-1 right-1 text-[8px] px-1.5 py-0.5' : 'top-2 right-2 text-[10px] px-2 py-1'"
        >
          <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
        </span>
        <span
          v-else-if="isUpcoming"
          class="absolute bg-accent/90 text-white font-bold rounded shadow"
          :class="compact ? 'top-1 right-1 text-[8px] px-1.5 py-0.5' : 'top-2 right-2 text-[10px] px-2 py-1'"
        >
          COMING SOON
        </span>
      </div>
      <div class="bg-black px-3 py-2.5">
        <h3 class="text-white font-extrabold text-sm leading-tight truncate">{{ matchup }}</h3>
        <p class="text-text-muted text-xs mt-0.5">{{ dateLabel }}</p>
      </div>
    </div>

    <!-- ===== DESKTOP: detailed card ===== -->
    <div class="hidden md:block relative overflow-hidden rounded-2xl p-5 border border-border bg-gradient-to-br from-card to-surface hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-card transition-all">
      <HotRibbon v-if="isPinned" side="right" />
      <!-- Badges -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span
            class="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border"
            :class="statusClass"
          >
            <span v-if="isLive" class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            {{ statusLabel }}
          </span>
          <span class="bg-primary/15 border border-primary/30 text-primary-light text-[11px] font-semibold px-2.5 py-1 rounded-full">
            {{ match.category || 'Sports' }}
          </span>
        </div>
      </div>

      <!-- Teams -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex-1 text-center min-w-0">
          <div class="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center">
            <img v-if="homeFlag" :src="homeFlag" :alt="match.homeTeam" loading="lazy" class="w-full h-full object-cover" @error="homeErr = true" />
            <span v-else class="text-2xl">🏳️</span>
          </div>
          <h3 class="text-white font-semibold text-sm truncate px-1">{{ match.homeTeam || 'Home' }}</h3>
        </div>

        <div class="px-3 shrink-0 flex flex-col items-center">
          <span class="text-text-muted font-bold text-lg">VS</span>
          <span v-if="countdown" class="text-text-muted text-[10px] mt-1 whitespace-nowrap">{{ dateLabel }}</span>
          <span v-if="countdown" class="text-primary-light text-[11px] font-semibold mt-0.5 whitespace-nowrap tabular-nums">⏱ {{ countdown }}</span>
        </div>

        <div class="flex-1 text-center min-w-0">
          <div class="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center">
            <img v-if="awayFlag" :src="awayFlag" :alt="match.awayTeam" loading="lazy" class="w-full h-full object-cover" @error="awayErr = true" />
            <span v-else class="text-2xl">🏳️</span>
          </div>
          <h3 class="text-white font-semibold text-sm truncate px-1">{{ match.awayTeam || 'Away' }}</h3>
        </div>
      </div>

      <!-- Bottom info -->
      <div class="flex items-center justify-between pt-4 border-t border-border">
        <div class="flex items-center gap-2 min-w-0">
          <svg class="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3h14v2a5 5 0 01-3 4.58A4 4 0 0113 12.9V16h3v2H8v-2h3v-3.1A4 4 0 018 9.58 5 5 0 015 5V3zm2 2v0a3 3 0 002 2.83V5H7zm10 0h-2v2.83A3 3 0 0017 5z"/></svg>
          <span class="text-text-muted text-xs truncate max-w-[160px]">{{ match.eventName || match.category }}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-surface border border-border rounded-full px-2.5 py-1">
          <svg class="w-4 h-4 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4"/></svg>
          <span class="text-primary-light text-xs font-semibold">{{ match.streamsCount || 0 }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'
import MatchPoster from './MatchPoster.vue'
import HotRibbon from './HotRibbon.vue'
import { resolveAsset } from '@/utils/assets'
import { useNow } from '@/composables/useNow'
import { statusOf } from '@/utils/matchStatus'

const props = defineProps({
  match: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})

const bannerErr = ref(false)
const homeErr = ref(false)
const awayErr = ref(false)

const bannerUrl = computed(() => resolveAsset(props.match.banner))
const homeFlag = computed(() => (homeErr.value ? '' : resolveAsset(props.match.homeLogo)))
const awayFlag = computed(() => (awayErr.value ? '' : resolveAsset(props.match.awayLogo)))

const matchup = computed(() => `${props.match.homeTeam || 'Team A'} vs ${props.match.awayTeam || 'Team B'}`)

// Time-authoritative status shared with the home/category/search tabs.
const now = useNow()
const status = computed(() => { now.value; return statusOf(props.match) })
const isLive = computed(() => status.value === 'live')
const isUpcoming = computed(() => status.value === 'upcoming')
const isFinished = computed(() => status.value === 'finished')
const isPinned = computed(() => props.match.isPinned === true)

const statusLabel = computed(() => {
  if (isLive.value) return 'LIVE'
  if (isFinished.value) return 'ENDED'
  return 'UPCOMING'
})
const statusClass = computed(() => {
  if (isLive.value) return 'bg-accent/15 border-accent/30 text-accent'
  if (isFinished.value) return 'bg-white/5 border-border text-text-muted'
  return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
})

const countdown = computed(() => {
  if (!isUpcoming.value || !props.match.startTime) return ''
  const diff = new Date(props.match.startTime).getTime() - now.value
  if (diff <= 0) return ''
  let s = Math.floor(diff / 1000)
  const d = Math.floor(s / 86400); s %= 86400
  const h = Math.floor(s / 3600); s %= 3600
  const m = Math.floor(s / 60); s %= 60
  const pad = (n) => String(n).padStart(2, '0')
  // Labelled format like the reference: "1d 07h 34m" (seconds only in the final hour).
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`
  if (h > 0) return `${pad(h)}h ${pad(m)}m`
  return `${pad(m)}m ${pad(s)}s`
})

const dateLabel = computed(() => {
  const value = props.match.startTime
  if (!value) return 'Schedule TBD'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Schedule TBD'
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  // Relative day label like the reference: Today / Tomorrow / weekday / date.
  const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  const dayDiff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86400000)
  let day
  if (dayDiff === 0) day = 'Today'
  else if (dayDiff === 1) day = 'Tomorrow'
  else if (dayDiff === -1) day = 'Yesterday'
  else if (dayDiff > 1 && dayDiff < 7) day = d.toLocaleDateString('en-US', { weekday: 'short' })
  else day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${day}, ${time}`
})
</script>
