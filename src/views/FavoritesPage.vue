<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-white mb-6">My Favorites</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="favoriteMatches.length === 0" class="text-center py-20">
        <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-text-muted mb-4">No favorites yet</p>
        <router-link
          to="/"
          class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors inline-block"
        >
          Browse Matches
        </router-link>
      </div>
      
      <!-- Favorites Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MatchCard
          v-for="match in favoriteMatches"
          :key="match._id"
          :match="match"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'

const matchesStore = useMatchesStore()

const loading = computed(() => matchesStore.loading)
const favoriteMatches = computed(() => matchesStore.favoriteMatches)

onMounted(() => {
  matchesStore.fetchMatches()
})
</script>
