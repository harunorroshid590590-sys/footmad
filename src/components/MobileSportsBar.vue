<template>
  <!-- Mobile-only horizontal sports scroller (desktop uses the left sidebar) -->
  <div class="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mt-1">
    <router-link
      v-for="sport in sports"
      :key="sport.slug"
      :to="`/category/${sport.slug}`"
      class="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full bg-card border border-border text-text-muted text-sm whitespace-nowrap hover:text-white hover:border-primary/50 transition-colors"
    >
      <span>{{ sport.icon }}</span>
      <span>{{ sport.name }}</span>
    </router-link>
  </div>
</template>

<script setup>
const sports = [
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
]
</script>
