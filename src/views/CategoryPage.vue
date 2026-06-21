<template>
  <div class="min-h-screen bg-background pb-20 md:pb-0">
    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6">
      <h1 class="text-2xl font-bold text-white mb-2 capitalize">{{ displayName }} Matches</h1>

      <ContentTabs :active="activeTab" @change="activeTab = $event" />

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <MatchCardSkeleton v-for="i in 8" :key="i" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-text-muted mb-4">{{ error }}</p>
        <button @click="fetchMatches" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="displayedMatches.length === 0" class="text-center py-20 text-text-muted">
        <p>{{ emptyLabel }}</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <MatchCard v-for="match in displayedMatches" :key="match.id" :match="match" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import MatchCard from '@/components/MatchCard.vue'
import MatchCardSkeleton from '@/components/MatchCardSkeleton.vue'
import ContentTabs from '@/components/ContentTabs.vue'
import { filterByTab, sortByPriority, emptyLabelFor, matchInSport, sportDisplayName } from '@/utils/matchStatus'

const route = useRoute()
const matchesStore = useMatchesStore()

const loading = computed(() => matchesStore.loading)
const error = computed(() => matchesStore.error)

const category = computed(() => route.params.category || 'All')
const displayName = computed(() => sportDisplayName(category.value))
const slugify = (s) => String(s || '').toLowerCase().replace(/[\s_]+/g, '-')

const activeTab = ref('all')

const categoryMatches = computed(() => {
  const slug = slugify(category.value)
  if (slug === 'all') return matchesStore.matches
  return matchesStore.matches.filter((m) => matchInSport(m, slug))
})

const displayedMatches = computed(() =>
  sortByPriority(filterByTab(categoryMatches.value, activeTab.value))
)

const emptyLabel = computed(() => emptyLabelFor(activeTab.value))

const fetchMatches = () => matchesStore.fetchMatches()

onMounted(() => {
  if (matchesStore.matches.length === 0) fetchMatches()
})
</script>
