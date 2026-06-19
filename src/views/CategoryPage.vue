<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-white mb-6 capitalize">{{ displayName }} Matches</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-text-muted mb-4">{{ error }}</p>
        <button
          @click="fetchMatches"
          class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
      
      <!-- Matches Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <MatchCard
          v-for="match in filteredMatches"
          :key="match._id"
          :match="match"
        />
        
        <div
          v-if="filteredMatches.length === 0"
          class="col-span-full text-center py-20"
        >
          <p class="text-text-muted">No matches found for {{ category }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'

const route = useRoute()
const matchesStore = useMatchesStore()

const loading = computed(() => matchesStore.loading)
const error = computed(() => matchesStore.error)
const matches = computed(() => matchesStore.matches)

const category = computed(() => route.params.category || 'All')

const displayName = computed(() => category.value.replace(/-/g, ' '))

const slugify = (s) => String(s || '').toLowerCase().replace(/[\s_]+/g, '-')

const filteredMatches = computed(() => {
  const slug = slugify(category.value)
  if (slug === 'all') {
    return matches.value
  }
  return matches.value.filter(match => slugify(match.category) === slug)
})

const fetchMatches = () => {
  matchesStore.fetchMatches()
}

onMounted(() => {
  fetchMatches()
})
</script>
