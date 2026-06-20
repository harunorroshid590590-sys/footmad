<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6">
    <h1 class="text-2xl font-bold text-white mb-2">Leagues</h1>

    <ContentTabs :active="activeTab" @change="activeTab = $event" />


    <!-- Loading -->
    <div v-if="matchesStore.loading && matchesStore.matches.length === 0" class="space-y-8">
      <div v-for="i in 3" :key="i">
        <div class="h-5 w-40 bg-card-hover rounded mb-3 animate-pulse"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <MatchCardSkeleton v-for="j in 4" :key="j" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="leagues.length === 0" class="text-center py-20 text-text-muted">
      <p>No leagues available right now.</p>
    </div>

    <!-- Leagues -->
    <div v-else class="space-y-8">
      <!-- League filter pills -->
      <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide -mb-2">
        <button
          @click="selected = ''"
          class="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
          :class="selected === '' ? 'bg-white text-black' : 'bg-card text-text-muted hover:text-white'"
        >
          All
        </button>
        <button
          v-for="lg in leagues"
          :key="lg.name"
          @click="selected = lg.name"
          class="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
          :class="selected === lg.name ? 'bg-white text-black' : 'bg-card text-text-muted hover:text-white'"
        >
          {{ lg.name }} <span class="opacity-60">({{ lg.matches.length }})</span>
        </button>
      </div>

      <section v-for="lg in visibleLeagues" :key="lg.name">
        <div class="flex items-center gap-2 mb-3">
          <h2 class="text-white font-bold text-lg truncate">{{ lg.name }}</h2>
          <span class="text-text-muted text-sm">· {{ lg.matches.length }}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <MatchCard v-for="m in lg.matches" :key="m.id" :match="m" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'
import MatchCardSkeleton from '@/components/MatchCardSkeleton.vue'
import ContentTabs from '@/components/ContentTabs.vue'
import { filterByTab } from '@/utils/matchStatus'

const matchesStore = useMatchesStore()
const selected = ref('')
const activeTab = ref('all')

// Group matches by their event/tournament name (the provider's "league").
const leagues = computed(() => {
  const groups = new Map()
  for (const m of filterByTab(matchesStore.matches, activeTab.value)) {
    const name = (m.eventName || m.category || 'Other').trim()
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(m)
  }
  return [...groups.entries()]
    .map(([name, matches]) => ({ name, matches }))
    .sort((a, b) => b.matches.length - a.matches.length)
})

const visibleLeagues = computed(() =>
  selected.value ? leagues.value.filter((l) => l.name === selected.value) : leagues.value
)

onMounted(() => {
  if (matchesStore.matches.length === 0) matchesStore.fetchMatches()
})
</script>
