<template>
  <div class="min-h-screen bg-background">
    <TickerStrip />

    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-2">
      <AdRenderer />

      <ContentTabs :active="activeTab" @change="setTab" />

      <!-- Mobile-only sports scroller (desktop has the sidebar) -->
      <MobileSportsBar />

      <!-- Loading -->
      <div v-if="matchesStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <MatchCardSkeleton v-for="i in 8" :key="i" />
      </div>

      <!-- Error -->
      <div v-else-if="matchesStore.error" class="text-center py-20">
        <p class="text-text-muted mb-4">{{ matchesStore.error }}</p>
        <button @click="matchesStore.fetchMatches()" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">
          Retry
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="matchesToShow.length === 0" class="text-center py-20 text-text-muted">
        <p>{{ emptyLabel }}</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <MatchCard v-for="m in matchesToShow" :key="m.id" :match="m" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import TickerStrip from '@/components/TickerStrip.vue'
import ContentTabs from '@/components/ContentTabs.vue'
import MobileSportsBar from '@/components/MobileSportsBar.vue'
import MatchCard from '@/components/MatchCard.vue'
import MatchCardSkeleton from '@/components/MatchCardSkeleton.vue'
import AdRenderer from '@/components/AdRenderer.vue'

const route = useRoute()
const router = useRouter()
const matchesStore = useMatchesStore()

const validTabs = ['all', 'live', 'upcoming', 'ended']
const activeTab = ref(validTabs.includes(route.query.tab) ? route.query.tab : 'all')

// Determine a match's status — kept consistent with the LIVE badge in MatchCard
// (live if the provider says live OR the match is currently within its time window).
const statusOf = (m) => {
  if (m.status === 'live' || m.isLive === true) return 'live'
  if (m.status === 'finished') return 'finished'
  if (m.status === 'upcoming') return 'upcoming'
  const now = new Date()
  const start = m.startTime ? new Date(m.startTime) : null
  const end = m.endTime ? new Date(m.endTime) : null
  if (start && end && now >= start && now <= end) return 'live'
  if (start && now < start) return 'upcoming'
  return 'finished'
}

// Ordering priority: pinned (admin) → live → upcoming → ended.
const rankOf = (m) => {
  if (m.isPinned === true) return 0
  const s = statusOf(m)
  if (s === 'live') return 1
  if (s === 'upcoming') return 2
  return 3 // finished
}

const sortByPriority = (list) =>
  list
    .map((m, i) => ({ m, i }))
    .sort((a, b) => rankOf(a.m) - rankOf(b.m) || a.i - b.i)
    .map((x) => x.m)

const matchesToShow = computed(() => {
  const all = matchesStore.matches
  let list = all
  if (activeTab.value === 'live') list = all.filter((m) => statusOf(m) === 'live')
  else if (activeTab.value === 'upcoming') list = all.filter((m) => statusOf(m) === 'upcoming')
  else if (activeTab.value === 'ended') list = all.filter((m) => statusOf(m) === 'finished')
  return sortByPriority(list)
})

const emptyLabel = computed(() => {
  if (activeTab.value === 'live') return 'No live matches right now.'
  if (activeTab.value === 'upcoming') return 'No upcoming matches.'
  if (activeTab.value === 'ended') return 'No ended matches.'
  return 'No matches available.'
})

const setTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: tab === 'all' ? {} : { tab } })
}

watch(() => route.query.tab, (tab) => {
  activeTab.value = validTabs.includes(tab) ? tab : 'all'
})

onMounted(() => {
  matchesStore.fetchMatches()
})
</script>
