<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    <TickerStrip />
    
    <div class="max-w-7xl mx-auto px-4 py-6">
      <AdRenderer />
      
      <CategoryScroll @category-selected="handleCategorySelect" />
      
      <LiveUpcomingTabs
        :active-tab="activeTab"
        :live-count="liveMatches.length"
        :upcoming-count="upcomingMatches.length"
        @tab-change="handleTabChange"
      />
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <MatchCardSkeleton v-for="i in 6" :key="i" />
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="text-text-muted mb-4">{{ error }}</p>
        <button
          @click="fetchMatches"
          class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="currentMatches.length === 0" class="text-center py-20">
        <svg class="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-text-muted">No matches available</p>
      </div>
      
      <!-- Matches Grid -->
      <div v-else>
        <div
          v-if="activeTab === 'live'"
          id="live"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <MatchCard
            v-for="match in filteredLiveMatches"
            :key="match.id"
            :match="match"
          />
        </div>
        
        <div
          v-else
          id="upcoming"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <MatchCard
            v-for="match in filteredUpcomingMatches"
            :key="match.id"
            :match="match"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMatchesStore } from '@/stores/matches'
import Navbar from '@/components/Navbar.vue'
import TickerStrip from '@/components/TickerStrip.vue'
import CategoryScroll from '@/components/CategoryScroll.vue'
import LiveUpcomingTabs from '@/components/LiveUpcomingTabs.vue'
import MatchCard from '@/components/MatchCard.vue'
import MatchCardSkeleton from '@/components/MatchCardSkeleton.vue'
import AdRenderer from '@/components/AdRenderer.vue'

const matchesStore = useMatchesStore()

const loading = computed(() => matchesStore.loading)
const error = computed(() => matchesStore.error)
const liveMatches = computed(() => matchesStore.liveMatches)
const upcomingMatches = computed(() => matchesStore.upcomingMatches)
const selectedCategory = computed(() => matchesStore.selectedCategory)

const activeTab = ref('live')

const filteredLiveMatches = computed(() => {
  if (selectedCategory.value === 'All') {
    return liveMatches.value
  }
  return liveMatches.value.filter(match => match.category === selectedCategory.value)
})

const filteredUpcomingMatches = computed(() => {
  if (selectedCategory.value === 'All') {
    return upcomingMatches.value
  }
  return upcomingMatches.value.filter(match => match.category === selectedCategory.value)
})

const currentMatches = computed(() => {
  if (activeTab.value === 'live') {
    return filteredLiveMatches.value
  }
  return filteredUpcomingMatches.value
})

const fetchMatches = async () => {
  await matchesStore.fetchMatches()
  // Auto-select a tab that actually has matches:
  // if there are no live matches but upcoming ones exist, show Upcoming by default.
  if (liveMatches.value.length === 0 && upcomingMatches.value.length > 0) {
    activeTab.value = 'upcoming'
  } else if (liveMatches.value.length > 0) {
    activeTab.value = 'live'
  }
}

const handleCategorySelect = (category) => {
  matchesStore.filterByCategory(category)
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

onMounted(() => {
  fetchMatches()
})
</script>
