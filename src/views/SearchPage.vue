<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Search Input -->
      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search matches, teams, leagues..."
            class="w-full bg-card border border-border rounded-xl px-4 py-3 pl-12 text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
            @input="handleSearch"
          />
          <svg class="w-5 h-5 absolute left-4 top-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Results -->
      <div v-else>
        <div v-if="searchQuery && filteredMatches.length > 0">
          <p class="text-text-muted mb-4">Found {{ filteredMatches.length }} results for "{{ searchQuery }}"</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MatchCard
              v-for="match in filteredMatches"
              :key="match.id"
              :match="match"
            />
          </div>
        </div>

        <div v-else-if="searchQuery && filteredMatches.length === 0">
          <div class="text-center py-20">
            <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-text-muted">No matches found for "{{ searchQuery }}"</p>
          </div>
        </div>

        <div v-else class="text-center py-20">
          <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p class="text-text-muted">Search for matches, teams, or leagues</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'

const route = useRoute()
const matchesStore = useMatchesStore()
const searchQuery = ref('')
const debouncedQuery = ref('')
let debounceTimer = null

const debounceSearch = (query) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = query
  }, 300)
}

watch(searchQuery, (newQuery) => {
  debounceSearch(newQuery)
})

// Keep the input in sync with the ?q= URL param (e.g. from the navbar search).
watch(() => route.query.q, (q) => {
  if (typeof q === 'string' && q !== searchQuery.value) {
    searchQuery.value = q
    debouncedQuery.value = q
  }
}, { immediate: true })

const filteredMatches = computed(() => {
  const query = debouncedQuery.value.trim().toLowerCase()
  if (!query) return []

  // Support "Team A vs Team B" style queries by also matching all parts.
  const terms = query.split(/\s+vs?\s+/).map(t => t.trim()).filter(Boolean)

  return matchesStore.matches.filter(match => {
    const home = String(match.homeTeam?.name ?? match.homeTeam ?? '').toLowerCase()
    const away = String(match.awayTeam?.name ?? match.awayTeam ?? '').toLowerCase()
    const event = String(match.eventName ?? match.league ?? '').toLowerCase()
    const category = String(match.category ?? '').toLowerCase()
    const haystack = `${home} ${away} ${event} ${category}`

    if (haystack.includes(query)) return true
    if (terms.length > 1) return terms.every(term => haystack.includes(term))
    return false
  })
})

const handleSearch = () => {
  // Search is reactive via computed
}

onMounted(() => {
  if (matchesStore.matches.length === 0) matchesStore.fetchMatches()
})
</script>
