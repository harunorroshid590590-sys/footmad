<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6">
    <h1 class="text-2xl font-bold text-white mb-6">All Sports</h1>

    <div v-if="matchesStore.loading && matchesStore.matches.length === 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div v-for="i in 10" :key="i" class="rounded-xl bg-card border border-border p-5 h-28 animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <router-link
        v-for="sport in sportsWithCounts"
        :key="sport.slug"
        :to="`/category/${sport.slug}`"
        class="group flex flex-col items-center justify-center gap-2 rounded-xl bg-card border border-border p-5 hover:border-primary/50 hover:-translate-y-0.5 transition-all"
      >
        <span class="text-3xl">{{ sport.icon }}</span>
        <span class="text-white font-semibold text-sm">{{ sport.name }}</span>
        <span class="text-text-muted text-xs">{{ sport.count }} match{{ sport.count === 1 ? '' : 'es' }}</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMatchesStore } from '@/stores/matches'

const matchesStore = useMatchesStore()

const SPORTS = [
  { name: 'Football', slug: 'football', icon: '⚽' },
  { name: 'Cricket', slug: 'cricket', icon: '🏏' },
  { name: 'Basketball', slug: 'nba', icon: '🏀' },
  { name: 'Tennis', slug: 'tennis', icon: '🎾' },
  { name: 'Boxing', slug: 'boxing', icon: '🥊' },
  { name: 'UFC', slug: 'ufc', icon: '🤼' },
  { name: 'Baseball', slug: 'mlb', icon: '⚾' },
  { name: 'Formula 1', slug: 'formula-1', icon: '🏎️' },
  { name: 'MotoGP', slug: 'motogp', icon: '🏍️' },
  { name: 'Hockey', slug: 'nhl', icon: '🏒' },
  { name: 'WWE', slug: 'wwe', icon: '🤼' },
]

const slugify = (s) => String(s || '').toLowerCase().replace(/[\s_]+/g, '-')

const sportsWithCounts = computed(() =>
  SPORTS.map((sport) => ({
    ...sport,
    count: matchesStore.matches.filter((m) => {
      const cat = slugify(m.category)
      return cat === sport.slug || cat === slugify(sport.name)
    }).length,
  }))
)

onMounted(() => {
  if (matchesStore.matches.length === 0) matchesStore.fetchMatches()
})
</script>
